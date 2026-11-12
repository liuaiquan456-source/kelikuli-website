import assert from "node:assert/strict";
import { test } from "node:test";
import { createLoader } from "./load-ts.mjs";
import { readFileSync } from "node:fs";

const data = createLoader()("lib/alibaba-draft-data.ts");
function product(overrides = {}) {
  const p = { id: 1, sku: "PS01", name: "Stone Arch Phone Stand", image: "https://kelikuli.com/images/ps01.jpg", images: "[]",
    description: "Stone arch phone stand for a desk.", moq: 50, leadTime: "30 days", status: "inactive", tags: "[]", variants: "[]",
    alibabaCategoryId: "12345", alibabaDimensions: "10 x 8 x 12 cm", alibabaPriceTiers: '[{"minQuantity":50,"unitPrice":5}]',
    alibabaListing: JSON.stringify({ salesUnit: "piece", piecesPerUnit: 1, minimumOrderQuantity: 50,
      leadTimeMinDays: 30, leadTimeMaxDays: 30,
      packaging: { lengthCm: 12, widthCm: 10, heightCm: 14, grossWeightKg: 0.6, confirmed: true },
      attributes: { countryOfOrigin: "China" } }),
    alibabaSyncEnabled: true, alibabaApprovalHash: "", ...overrides };
  p.alibabaApprovalHash = data.draftContentHash(p);
  return p;
}

function configure(t, overrides = {}) {
  const values = { ALIBABA_DRAFT_GATEWAY_URL: "https://connector.example.test", ALIBABA_DRAFT_GATEWAY_TOKEN: "test-only-gateway-token-32-characters",
    ALIBABA_SHOP_ID: "test-shop", ALIBABA_DRAFT_ENABLED: "true", ALIBABA_AUTO_SYNC_ENABLED: "false",
    KELIKULI_ACTIONS_KEY: "test-only-actions-key-32-characters", ...overrides };
  for (const [key, value] of Object.entries(values)) {
    const old = process.env[key];
    process.env[key] = value;
    t.after(() => { if (old === undefined) delete process.env[key]; else process.env[key] = old; });
  }
}

function harness(t, { p = product(), respond } = {}) {
  let row = null;
  const calls = [];
  const prisma = {
    product: { findUnique: async () => ({ ...p }) },
    alibabaDraft: {
      findUnique: async () => row && { ...row },
      create: async ({ data: input }) => {
        if (row) throw Object.assign(new Error("unique"), { code: "P2002" });
        row = { ...input, draftId: null, message: "", createdAt: new Date(), updatedAt: new Date() };
        return { ...row };
      },
      updateMany: async ({ where, data: input }) => {
        if (!row || row.status !== where.status || (where.updatedAt && +row.updatedAt !== +where.updatedAt)) return { count: 0 };
        row = { ...row, ...input, updatedAt: new Date() };
        return { count: 1 };
      },
      update: async ({ data: input }) => {
        row = { ...row, ...input, updatedAt: new Date() };
        return { ...row };
      },
    },
  };
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, body, options });
    const result = respond ? await respond(url, body) : undefined;
    const payload = result ?? (url.endsWith("/validate")
      ? { valid: true, validationToken: "approved-snapshot", missingFields: [] }
      : { status: "draft", draftId: "draft-123", sku: body.sku, idempotencyKey: body.idempotencyKey });
    return Response.json({ shopId: "test-shop", method: data.DRAFT_METHOD, ...payload });
  };
  t.after(() => { globalThis.fetch = previousFetch; });
  const load = createLoader({ "./prisma": { prisma }, "@/lib/prisma": { prisma } });
  return { ...load("lib/alibaba-drafts.ts"), p, calls, getRow: () => row, setRow: value => { row = value; }, load };
}

test("product requirements report omissions; approval is invalidated by export changes", () => {
  const p = product();
  assert.deepEqual(data.missingProductFields(p), []);
  assert.equal(data.isAlibabaApproved({ ...p, moq: 100 }), false);
  assert.equal(data.isAlibabaApproved({ ...p, name: "Updated title" }), false);
  assert.equal(data.isAlibabaApproved({ ...p, alibabaSyncEnabled: false }), true);
  const missing = data.missingProductFields({ ...p, sku: null, alibabaCategoryId: "", image: "blob:upload", alibabaDimensions: "", alibabaPriceTiers: "[]", description: "", alibabaApprovalHash: "" });
  for (const field of ["sku", "alibabaCategoryId", "images.0", "alibabaDimensions", "alibabaPriceTiers", "description", "review"]) assert.ok(missing.some(item => item.field === field));
  assert.throws(() => data.parseTiers([{ minQuantity: 1, unitPrice: Infinity }]));
  assert.throws(() => data.parseTiers([{ minQuantity: 1.2, unitPrice: 5 }]));
  assert.equal(data.alibabaProductInput({ sku: " ps01 " }).sku, "PS01");
  assert.ok(data.missingProductFields(product({ alibabaPriceTiers: '[{"minQuantity":1,"unitPrice":5}]' })).some(item => item.field === "alibabaPriceTiers"));
});

test("missing authorization and incomplete data never call gateway or create receipts", async t => {
  configure(t, { ALIBABA_DRAFT_ENABLED: "false" });
  const h = harness(t, { p: product({ alibabaCategoryId: "" }) });
  const result = await h.syncAlibabaDraft(1);
  assert.equal(result.status, "blocked");
  assert.ok(result.missingFields.some(item => item.field === "permission"));
  assert.ok(result.missingFields.some(item => item.field === "alibabaCategoryId"));
  assert.equal(h.calls.length, 0);
  assert.equal(h.getRow(), null);
});

test("manual sync validates category, saves draft ID and deduplicates later calls", async t => {
  configure(t);
  const h = harness(t);
  assert.equal((await h.syncAlibabaDraft(1)).draftId, "draft-123");
  assert.equal(h.getRow().status, "draft");
  assert.equal(h.calls.length, 2);
  assert.ok(h.calls.every(call => call.body.draftOnly === true && call.body.method === data.DRAFT_METHOD));
  assert.ok(h.calls.every(call => call.options.redirect === "error"));
  assert.equal(h.calls[0].body.product.sku, "PS01");
  assert.deepEqual(h.calls[0].body.product.priceTiers, [{ minQuantity: 50, unitPrice: 5 }]);
  assert.equal(h.calls[1].body.validationToken, "approved-snapshot");
  assert.equal((await h.syncAlibabaDraft(1)).existing, true);
  h.p.moq = 100;
  assert.equal((await h.syncAlibabaDraft(1)).changedSinceSync, true);
  assert.equal(h.calls.length, 2);
});

test("parallel requests can create only one draft", async t => {
  configure(t);
  const h = harness(t);
  const results = await Promise.all([h.syncAlibabaDraft(1), h.syncAlibabaDraft(1)]);
  assert.ok(results.some(result => result.status === "draft"));
  assert.equal(h.calls.filter(call => call.url.endsWith("/drafts")).length, 1);
});

test("automatic sync requires global enablement, opt-in and approval", async t => {
  configure(t);
  const h = harness(t);
  assert.equal((await h.syncAlibabaDraft(1, "automatic")).status, "disabled");
  process.env.ALIBABA_AUTO_SYNC_ENABLED = "true";
  h.p.alibabaSyncEnabled = false;
  assert.equal((await h.syncAlibabaDraft(1, "automatic")).status, "disabled");
  h.p.alibabaSyncEnabled = true;
  h.p.alibabaApprovalHash = "";
  assert.equal((await h.syncAlibabaDraft(1, "automatic")).status, "disabled");
  assert.equal(h.calls.length, 0);
  h.p.alibabaApprovalHash = data.draftContentHash(h.p);
  assert.equal((await h.syncAlibabaDraft(1, "automatic")).status, "draft");
});

test("category missing fields block creation and a corrected retry can succeed", async t => {
  configure(t);
  let incomplete = true;
  const h = harness(t, { respond: url => url.endsWith("/validate") && incomplete
    ? { valid: false, missingFields: [{ field: "material", message: "请选择材质。" }] } : undefined });
  const result = await h.syncAlibabaDraft(1);
  assert.equal(result.status, "blocked");
  assert.equal(result.missingFields[0].field, "material");
  assert.equal(h.getRow().status, "failed");
  assert.equal(h.calls.length, 1);
  incomplete = false;
  assert.equal((await h.syncAlibabaDraft(1)).status, "draft");
});

test("changed approval during remote validation cancels creation", async t => {
  configure(t);
  const p = product();
  const h = harness(t, { p, respond: () => { p.moq = 100; } });
  assert.equal((await h.syncAlibabaDraft(1)).status, "failed");
  assert.equal(h.calls.length, 1);
  assert.equal(h.getRow().status, "failed");
});

test("lost create response is reconciled by lookup without submitting again", async t => {
  configure(t);
  const h = harness(t, { respond: url => { if (url.endsWith("/drafts")) throw new Error("secret URL token must not escape"); } });
  const first = await h.syncAlibabaDraft(1);
  assert.equal(first.status, "uncertain");
  assert.doesNotMatch(JSON.stringify(first), /secret URL/);
  assert.equal(h.getRow().status, "uncertain");
  assert.equal((await h.syncAlibabaDraft(1)).draftId, "draft-123");
  assert.equal(h.calls.filter(call => call.url.endsWith("/drafts")).length, 1);
  assert.equal(h.calls.at(-1).url, "https://connector.example.test/drafts/lookup");
});

test("stale locks and unconfirmed lookups never auto-create; wrong-shop responses fail closed", async t => {
  configure(t);
  const h = harness(t, { respond: () => ({ shopId: "another-shop" }) });
  assert.equal((await h.syncAlibabaDraft(1)).status, "failed");
  h.setRow({ ...h.getRow(), status: "syncing", updatedAt: new Date(0) });
  assert.equal((await h.syncAlibabaDraft(1)).status, "uncertain");
  assert.equal(h.getRow().status, "uncertain");
  assert.equal(h.calls.filter(call => call.url.endsWith("/drafts")).length, 0);
});

test("published or mismatched receipts are never accepted as drafts", async t => {
  configure(t);
  const h = harness(t, { respond: url => url.endsWith("/drafts") ? { status: "published", draftId: "123" } : undefined });
  assert.equal((await h.syncAlibabaDraft(1)).status, "uncertain");
  assert.equal(h.getRow().draftId, null);
});

test("Actions authentication is scoped, rejects bad tokens, and cannot approve or publish", async t => {
  configure(t);
  let reads = 0;
  const prisma = { product: { findUnique: async () => { reads++; return { id: 1 }; } } };
  const load = createLoader({ "@/lib/prisma": { prisma }, "./prisma": { prisma },
    "./admin-auth": { hasAdminSession: async () => false },
    "@/lib/alibaba-drafts": { syncAlibabaDraft: async () => ({ status: "blocked", missingFields: [{ field: "review", message: "待审核" }] }) } });
  const route = load("app/api/integrations/alibaba/drafts/route.ts");
  const { NextRequest } = await import("next/server.js");
  const req = (body, token = process.env.KELIKULI_ACTIONS_KEY) => new NextRequest("https://kelikuli.com/api/integrations/alibaba/drafts", {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  assert.equal((await route.POST(req({ sku: "PS01" }, "wrong"))).status, 401);
  assert.equal(reads, 0);
  assert.equal((await route.POST(req({ sku: "PS01", publish: true }))).status, 400);
  assert.equal((await route.POST(req({ sku: "PS01", alibabaApprove: true }))).status, 400);
  assert.equal(reads, 0);
  const response = await route.POST(req({ sku: "ps01" }));
  assert.equal(response.status, 422);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(reads, 1);
  process.env.KELIKULI_ACTIONS_KEY = "";
  assert.equal((await route.POST(req({ sku: "PS01" }, ""))).status, 401);
});

test("admin save reviews the committed snapshot; later edits invalidate approval", async () => {
  const p = product();
  const tx = { product: { update: async ({ data: update }) => Object.assign(p, update) } };
  const { saveAlibabaReview } = createLoader()("lib/alibaba-product-review.ts");
  p.moq = 100;
  await saveAlibabaReview(tx, p, undefined);
  assert.equal(p.alibabaApprovalHash, "");
  await saveAlibabaReview(tx, p, true);
  assert.equal(data.isAlibabaApproved(p), true);
  await saveAlibabaReview(tx, p, false);
  assert.equal(p.alibabaApprovalHash, "");
});

test("OpenAPI exposes only status and SKU-only draft requests", () => {
  const schema = JSON.parse(readFileSync(new URL("../public/openapi/alibaba-drafts.json", import.meta.url)));
  const path = schema.paths["/api/integrations/alibaba/drafts"];
  assert.deepEqual(Object.keys(path).sort(), ["get", "post"]);
  assert.deepEqual(path.post.requestBody.content["application/json"].schema.required, ["sku"]);
  assert.equal(path.post.requestBody.content["application/json"].schema.additionalProperties, false);
});
