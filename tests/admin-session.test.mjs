import assert from "node:assert/strict";
import { test } from "node:test";
import { createHmac } from "node:crypto";
import { createLoader } from "./load-ts.mjs";

const secret = "test-only-session-secret-at-least-32-bytes";

function useSecret(t) {
  const previous = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = secret;
  t.after(() => {
    if (previous === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = previous;
  });
}

test("signed sessions reject forgery, tampering, expiry and missing configuration", async (t) => {
  useSecret(t);
  const { createAdminSession, readAdminSession } = createLoader()("lib/admin-session.ts");
  const token = await createAdminSession(1);
  assert.equal((await readAdminSession(token)).userId, 1);
  assert.equal(await readAdminSession("1:admin@example.com"), null);
  const [payload, signature] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ userId: 2, expiresAt: Date.now() / 1000 + 1000 })).toString("base64url");
  assert.equal(await readAdminSession(`${forged}.${signature}`), null);
  assert.equal(await readAdminSession(`${payload}.invalid`), null);
  const expired = Buffer.from(JSON.stringify({ userId: 1, expiresAt: 1 })).toString("base64url");
  const expiredSignature = createHmac("sha256", secret).update(expired).digest("base64url");
  assert.equal(await readAdminSession(`${expired}.${expiredSignature}`), null);
  process.env.ADMIN_SESSION_SECRET = "";
  assert.equal(await readAdminSession(token), null);
  assert.equal(await createAdminSession(1), null);
});

test("private product reads and writes reject unsigned cookies; signed admin can still edit original data", async (t) => {
  useSecret(t);
  let active = true;
  let reads = 0;
  let writes = 0;
  const product = { id: 1, specs: "PRIVATE ORIGINAL NOTE", tags: "[]", images: "[]", variants: "[]", alibabaApprovalHash: "", alibabaSyncEnabled: false };
  const prisma = {
    $transaction: async (fn) => fn(prisma),
    adminUser: { findUnique: async () => ({ status: active ? "active" : "inactive" }) },
    product: {
      findMany: async () => { reads++; return [product]; },
      findUnique: async () => { reads++; return product; },
      create: async () => { writes++; return product; },
      update: async () => { writes++; return product; },
      delete: async () => { writes++; return product; },
    },
  };
  const load = createLoader({ "@/lib/prisma": { prisma }, "./prisma": { prisma } });
  const list = load("app/api/admin/products/route.ts");
  const detail = load("app/api/admin/products/[id]/route.ts");
  const { createAdminSession } = load("lib/admin-session.ts");
  const { NextRequest } = await import("next/server.js");
  const req = (token) => new NextRequest("https://kelikuli.com/api/admin/products", { headers: token ? { cookie: `admin_session=${token}` } : {} });
  const context = { params: Promise.resolve({ id: "1" }) };
  for (const token of [undefined, "1:admin@example.com"]) {
    for (const handler of [list.GET, list.POST, detail.GET, detail.PATCH, detail.DELETE]) {
      assert.equal((await handler(req(token), context)).status, 401);
    }
  }
  assert.equal(reads, 0);
  assert.equal(writes, 0);
  const token = await createAdminSession(1);
  const response = await detail.GET(req(token), context);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).specs, product.specs);
  assert.equal((await list.GET(req(token))).status, 200);
  const patch = new NextRequest("https://kelikuli.com/api/admin/products/1", {
    method: "PATCH",
    headers: { cookie: `admin_session=${token}`, "content-type": "application/json" },
    body: JSON.stringify({ specs: product.specs }),
  });
  assert.equal((await detail.PATCH(patch, context)).status, 200);
  assert.equal(writes, 1);
  active = false;
  assert.equal((await detail.GET(req(token), context)).status, 401);
});

test("login issues a signed cookie and admin proxy rejects old cookies", async (t) => {
  useSecret(t);
  let updates = 0;
  const prisma = { adminUser: {
    findUnique: async () => ({ id: 1, email: "staff@example.com", name: "Staff", role: "Admin", password: "test-password", status: "active" }),
    update: async () => { updates++; },
  } };
  const load = createLoader({ "@/lib/prisma": { prisma } });
  const login = load("app/api/admin/login/route.ts");
  const { proxy } = load("proxy.ts");
  const { readAdminSession } = load("lib/admin-session.ts");
  const { NextRequest } = await import("next/server.js");
  const request = new NextRequest("https://kelikuli.com/api/admin/login", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "staff@example.com", password: "test-password" }),
  });
  const response = await login.POST(request);
  const token = response.cookies.get("admin_session").value;
  assert.equal(response.status, 200);
  assert.equal((await readAdminSession(token)).userId, 1);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
  assert.equal(updates, 1);
  const forged = new NextRequest("https://kelikuli.com/admin/products", { headers: { cookie: "admin_session=1:staff@example.com" } });
  assert.equal((await proxy(forged)).status, 307);
  const valid = new NextRequest("https://kelikuli.com/admin/products", { headers: { cookie: `admin_session=${token}` } });
  assert.equal((await proxy(valid)).headers.get("x-middleware-next"), "1");
});
