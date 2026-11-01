import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server.js";
import { createLoader } from "./load-ts.mjs";

test("content links form a complete service, guide and project graph with existing images", () => {
  const load = createLoader();
  const { services } = load("data/manufacturing.ts");
  const { buyingGuides } = load("data/buying-guides.ts");
  const { developmentProjects } = load("data/development-projects.ts");
  assert.equal(services.length, 7);
  assert.equal(buyingGuides.length, 6);
  assert.equal(developmentProjects.length, 3);
  assert.equal(new Set(services.map((s) => s.slug)).size, 7);
  for (const s of services) {
    assert.ok(buyingGuides.some((g) => g.slug === s.guide));
    assert.ok(developmentProjects.some((p) => p.slug === s.project));
    assert.equal(s.timing.length, 4);
  }
  for (const g of buyingGuides) {
    assert.ok(services.some((s) => s.slug === g.service));
    assert.ok(developmentProjects.some((p) => p.slug === g.project));
  }
  for (const p of developmentProjects) {
    assert.ok(services.some((s) => s.slug === p.service));
    assert.ok(buyingGuides.some((g) => g.slug === p.guide));
    assert.ok(existsSync(`public${p.image}`));
    assert.equal(p.stages.length, 8);
    assert.match(
      p.stages.find(([name]) => name === "Mass production")[1],
      /Not (documented|verified)/,
    );
  }
});

test("source and quote attribution reject external URLs and arbitrary metadata", () => {
  const load = createLoader();
  const { normalizeInquiry, normalizeAttribution } = load(
    "lib/inquiry-data.ts",
  );
  const { quoteHref } = load("lib/content.ts");
  const clean = normalizeAttribution({
    sourcePage: "https://evil.test/",
    landingPage: "/buying-guides/resin-prototype-mold-cost?email=secret",
    service: "fake-service",
    country: "UK",
    email: "secret",
    productId: "4<script>",
  });
  assert.equal(clean.sourcePage, "");
  assert.equal(clean.service, "");
  assert.equal(clean.productId, "");
  assert.equal(clean.landingPage, "/buying-guides/resin-prototype-mold-cost");
  assert.ok(!("email" in clean));
  assert.equal(
    quoteHref(
      {
        source: "/services/3d-design-prototyping",
        service: "3d-design-prototyping",
      },
      true,
    ),
    "/get-a-quote?source=%2Fservices%2F3d-design-prototyping&service=3d-design-prototyping#upload",
  );
  assert.throws(() =>
    normalizeInquiry({
      name: "A",
      message: "Need a prototype",
      email: "not-email",
    }),
  );
  assert.throws(() =>
    normalizeInquiry({ name: "A", message: "Need a prototype" }),
  );
  assert.throws(() =>
    normalizeInquiry({
      name: "A",
      message: "Need a prototype",
      email: "a@example.test",
      attachments: [{ url: "/uploads/inquiries/public.pdf", name: "old.pdf" }],
    }),
  );
  assert.equal(
    normalizeInquiry({ name: "A", message: "Prototype", phone: "+44 12345678" })
      .email,
    "",
  );
});

test("inquiry APIs protect customer reads and mutations; public submission returns only a receipt", async () => {
  let authorized = false,
    saved;
  const prisma = {
    inquiry: {
      findMany: async () => [
        { id: 7, email: "private@example.test", status: "unread" },
      ],
      create: async (query) => {
        saved = query;
        return { id: 9 };
      },
      update: async () => {
        throw new Error("must not mutate");
      },
      delete: async () => {
        throw new Error("must not mutate");
      },
    },
  };
  const load = createLoader({
    "@/lib/prisma": { prisma },
    "@/lib/admin-auth": { hasAdminSession: async () => authorized },
    "@/lib/email": { sendInquiryEmail: async () => {} },
  });
  const route = load("app/api/inquiries/route.ts");
  const admin = load("app/api/inquiries/[id]/route.ts");
  const req = new NextRequest("https://kelikuli.com/api/inquiries");
  assert.equal((await route.GET(req)).status, 401);
  assert.equal(
    (await admin.PATCH(req, { params: Promise.resolve({ id: "7" }) })).status,
    401,
  );
  assert.equal(
    (await admin.DELETE(req, { params: Promise.resolve({ id: "7" }) })).status,
    401,
  );
  const response = await route.POST(
    new NextRequest(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Buyer",
        email: "buyer@example.test",
        message: "Need a model",
        attribution: {
          sourcePage: "/buying-guides/prepare-artwork-custom-resin",
          country: "UK",
          quantity: "200",
          dimensions: "10 cm",
        },
      }),
    }),
  );
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { success: true, id: 9 });
  assert.equal(JSON.parse(saved.data.attribution).country, "UK");
  assert.deepEqual(saved.select, { id: true });
  authorized = true;
  assert.equal(
    (await route.GET(req)).headers.get("cache-control"),
    "private, no-store",
  );
});

test("design upload is private, supports 3D files and requires admin authentication to download", async () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "kelikuli-upload-test-"),
  );
  const previous = process.env.INQUIRY_UPLOAD_DIR;
  process.env.INQUIRY_UPLOAD_DIR = directory;
  let authorized = false;
  try {
    const load = createLoader({
      "@/lib/admin-auth": { hasAdminSession: async () => authorized },
    });
    const upload = load("app/api/inquiries/upload/route.ts");
    const download = load("app/api/inquiries/files/[filename]/route.ts");
    const data = new FormData();
    data.append("file", new File(["solid sample\nendsolid"], "model.stl"));
    const response = await upload.POST(
      new NextRequest("https://kelikuli.com/api/inquiries/upload", {
        method: "POST",
        body: data,
      }),
    );
    assert.equal(response.status, 200);
    const attachment = await response.json();
    assert.match(attachment.url, /^\/api\/inquiries\/files\/.*\.stl$/);
    const filename = attachment.url.split("/").pop();
    assert.equal(
      readFileSync(path.join(directory, filename), "utf8"),
      "solid sample\nendsolid",
    );
    const req = new NextRequest(`https://kelikuli.com${attachment.url}`);
    assert.equal(
      (await download.GET(req, { params: Promise.resolve({ filename }) }))
        .status,
      401,
    );
    authorized = true;
    const accepted = await download.GET(req, {
      params: Promise.resolve({ filename }),
    });
    assert.equal(accepted.status, 200);
    assert.match(accepted.headers.get("content-disposition"), /^attachment;/);
    assert.equal(
      (
        await download.GET(req, {
          params: Promise.resolve({ filename: "../../.env" }),
        })
      ).status,
      404,
    );
    const bad = new FormData();
    bad.append("file", new File(["<script>bad</script>"], "page.html"));
    assert.equal(
      (
        await upload.POST(
          new NextRequest(req.url, { method: "POST", body: bad }),
        )
      ).status,
      400,
    );
  } finally {
    if (previous === undefined) delete process.env.INQUIRY_UPLOAD_DIR;
    else process.env.INQUIRY_UPLOAD_DIR = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});

test("FAQ answers exist in initial HTML and need no client interaction", async () => {
  const load = createLoader({
    "@/lib/prisma": {
      prisma: {
        fAQ: {
          findMany: async () => [
            {
              id: 1,
              question: "What should I provide?",
              answer: "Send dimensions and approved artwork.",
            },
          ],
        },
      },
    },
    "@/lib/i18n": { getTranslator: async () => (_key, fallback) => fallback },
  });
  const tree = await load("components/FaqSection.tsx").default({ page: "faq" });
  const html = renderToStaticMarkup(tree);
  assert.match(html, /<details/);
  assert.match(html, /<summary[^>]*>What should I provide\?/);
  assert.match(html, /Send dimensions and approved artwork\./);
});

test("GA4 lead payload excludes contacts, files and free text and stays disabled without configuration", () => {
  const prior = global.window;
  const calls = [];
  global.window = {
    location: { origin: "https://kelikuli.com", pathname: "/get-a-quote" },
    gtag: (...args) => calls.push(args),
  };
  try {
    const { trackSavedInquiry } = createLoader()("lib/quote-analytics.ts");
    const input = {
      sourcePage: "/services/3d-design-prototyping?email=secret",
      country: "private-country",
      dimensions: "private-dimensions",
      email: "private@example.test",
      service: "3d-design-prototyping",
    };
    trackSavedInquiry(input);
    assert.equal(calls.length, 0);
    window.kelikuliGa4Id = "G-TEST123";
    trackSavedInquiry(input);
    assert.equal(calls[0][1], "generate_lead");
    assert.doesNotMatch(
      JSON.stringify(calls),
      /secret|private|email|dimensions|country/,
    );
    assert.equal(calls[0][2].source_page, "/services/3d-design-prototyping");
  } finally {
    global.window = prior;
  }
});
