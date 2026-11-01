import assert from "node:assert/strict";
import { test } from "node:test";
import { createLoader } from "./load-ts.mjs";

const source = {
  id: 530, name: "Resin Cat", category: "Resin Crafts", image: "/cat.jpg",
  images: '["/cat.jpg"]', video: "", moq: 50, leadTime: "30-45 days",
  description: "Hand-painted resin organizer.",
  specs: "Customer request note (via Custom Lab):\nMaterial: PRIVATE CUSTOMER REQUIREMENT\nIP notes: PRIVATE IP REVIEW\nLocal status: draft\n\n---\nMaterial: Polyresin\nSize: 12 cm\nFactory price: PRIVATE COST\nUnreviewed field: PRIVATE DATA",
  variants: '[{"name":"Ivory","image":"/ivory.jpg","internalNote":"PRIVATE VARIANT"}]',
  tags: '["Custom Lab","Auto-Published"]', status: "active", price: 5,
  stock: 20, seoKeywords: "PRIVATE SEO", seoTitle: "", seoDesc: "",
  createdAt: new Date(), updatedAt: new Date(),
};

test("public projection removes private fields, nested extras and complete customer notes", () => {
  const { toPublicProduct } = createLoader()("lib/public-products.ts");
  const product = toPublicProduct(source);
  assert.equal(product.specs, "Material: Polyresin\nSize: 12 cm");
  assert.equal(product.description, source.description);
  assert.deepEqual(product.variants, [{ name: "Ivory", image: "/ivory.jpg" }]);
  for (const field of ["price", "stock", "tags", "status", "seoKeywords", "createdAt", "updatedAt"]) {
    assert.equal(field in product, false, field);
  }
  assert.doesNotMatch(JSON.stringify(product), /PRIVATE|Custom Lab|Auto-Published|draft/);
  assert.match(source.specs, /PRIVATE CUSTOMER REQUIREMENT/);
});

test("malformed arrays and internal text fail closed without breaking public products", () => {
  const { toPublicProduct, publicSpecifications } = createLoader()("lib/public-products.ts");
  const product = toPublicProduct({ ...source, images: "broken", variants: "{}", description: "IP notes: PRIVATE" });
  assert.deepEqual(product.images, []);
  assert.deepEqual(product.variants, []);
  assert.equal(product.description, "");
  assert.equal(publicSpecifications("Customer request note (via Custom Lab):\nMaterial: PRIVATE"), "");
  assert.equal(publicSpecifications('Submitted category "private" is unknown\nPRIVATE\n---\nMaterial: Resin'), "Material: Resin");
  assert.equal(publicSpecifications("Material: Resin; IP notes: PRIVATE\nColors: White"), "Colors: White");
});

test("public collection and detail enforce active products and never return database records", async () => {
  const queries = [];
  const prisma = { product: {
    findMany: async (query) => { queries.push(query); return [source]; },
    findFirst: async (query) => { queries.push(query); return query.where.id === 530 ? source : null; },
  } };
  const load = createLoader({ "@/lib/prisma": { prisma } });
  const list = load("app/api/products/route.ts");
  const detail = load("app/api/products/[id]/route.ts");
  const { NextRequest } = await import("next/server.js");
  const req = new NextRequest("https://kelikuli.com/api/products?status=inactive&search=Cat");
  const response = await list.GET(req);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.doesNotMatch(await response.text(), /PRIVATE|Auto-Published|draft/);
  assert.equal(queries[0].where.status, "active");
  assert.equal(queries[0].select.stock, undefined);
  const found = await detail.GET(req, { params: Promise.resolve({ id: "530" }) });
  assert.equal(found.status, 200);
  assert.doesNotMatch(await found.text(), /PRIVATE|Auto-Published|draft/);
  const missing = await detail.GET(req, { params: Promise.resolve({ id: "531" }) });
  assert.equal(missing.status, 404);
  assert.equal(queries.at(-1).where.status, "active");
  const count = queries.length;
  for (const id of ["530abc", "-1", "0", "9007199254740993"]) {
    assert.equal((await detail.GET(req, { params: Promise.resolve({ id }) })).status, 404);
  }
  assert.equal(queries.length, count);
  assert.equal(list.POST, undefined);
  assert.equal(detail.PATCH, undefined);
  assert.equal(detail.DELETE, undefined);
});

test("server-rendered detail and related props contain only public data; drafts get no metadata", async () => {
  const queries = [];
  let unavailable = false;
  const prisma = { product: {
    findFirst: async (query) => { queries.push(query); return unavailable ? null : source; },
    findMany: async (query) => { queries.push(query); return [{ ...source, id: 529 }]; },
  } };
  function ProductClient() { return null; }
  const load = createLoader({
    "@/lib/prisma": { prisma },
    "@/lib/settings": { getSettings: async () => ({ whatsapp: "123" }), waMe: () => "https://wa.me/123" },
    "./_client": { __esModule: true, default: ProductClient },
    "@/components/Breadcrumb": { __esModule: true, default: () => null },
    "next/navigation": { notFound: () => { throw new Error("NOT_FOUND"); } },
  });
  const page = load("app/products/[id]/page.tsx");
  const context = { params: Promise.resolve({ id: "530" }) };
  const result = await page.default(context);
  const client = result.props.children.find((child) => child.type === ProductClient);
  assert.ok(client);
  assert.doesNotMatch(JSON.stringify(client.props), /PRIVATE|Auto-Published|draft/);
  assert.equal(client.props.related.length, 1);
  assert.ok(queries.every((query) => query.where.status === "active"));
  unavailable = true;
  assert.deepEqual(await page.generateMetadata(context), { title: "Product Not Found" });
  await assert.rejects(page.default(context), /NOT_FOUND/);
});
