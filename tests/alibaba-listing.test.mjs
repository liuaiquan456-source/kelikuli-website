import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createLoader } from "./load-ts.mjs";
import { NextRequest } from "next/server.js";

const load = createLoader();
const listing = load("lib/alibaba-listing.ts");
const data = load("lib/alibaba-draft-data.ts");
const complete = () => ({ salesUnit: "set", piecesPerUnit: 8, minimumOrderQuantity: 50,
  leadTimeMinDays: 30, leadTimeMaxDays: 45,
  packaging: { lengthCm: 40, widthCm: 30, heightCm: 20, grossWeightKg: 3, confirmed: true },
  attributes: { material: "Resin", feature: "Artistic", technique: "Hand-painted", pattern: "Sculpture",
    productType: "Bobble Head", style: "Music", application: "Art and Collectible", countryOfOrigin: "China" } });
const product = (extra = {}) => ({ id: 523, sku: "TEST-523", name: "Test Resin Bobblehead Set", image: "https://kelikuli.com/test.jpg",
  images: "[]", description: "Test figurines for desk decoration.", moq: 400, leadTime: "30-45 days",
  alibabaCategoryId: "1720", alibabaDimensions: "Target height 13-15 cm, prototype approval required",
  alibabaPriceTiers: JSON.stringify([{ minQuantity: 50, unitPrice: 72 }]), alibabaListing: JSON.stringify(complete()),
  alibabaSyncEnabled: false, alibabaApprovalHash: "", ...extra });

test("set prices, MOQ and gross packaging export together without converting to pieces", () => {
  const p = product(); p.alibabaApprovalHash = data.draftContentHash(p);
  const payload = data.draftPayload(p);
  assert.equal(payload.moq, 50);
  assert.equal(payload.websiteMoq, 400);
  assert.equal(payload.listing.salesUnit, "set");
  assert.equal(payload.listing.piecesPerUnit, 8);
  assert.deepEqual(payload.priceTiers, [{ minQuantity: 50, unitPrice: 72 }]);
  assert.equal(payload.listing.packaging.grossWeightKg, 3);
  assert.deepEqual(data.missingProductFields(p), []);
  const changed = complete(); changed.packaging.grossWeightKg = 4;
  assert.equal(data.isAlibabaApproved({ ...p, alibabaListing: JSON.stringify(changed) }), false);
});

test("unknown packaging remains unknown and cannot pass readiness or review", async () => {
  const unknown = complete(); unknown.packaging = {};
  const p = product({ alibabaListing: JSON.stringify(unknown) });
  const normalized = data.draftPayload(p).listing;
  assert.equal(normalized.packaging.lengthCm, null);
  assert.equal(normalized.packaging.confirmed, false);
  const missing = data.missingProductFields(p);
  for (const name of ["lengthCm", "widthCm", "heightCm", "grossWeightKg", "confirmed"]) {
    assert.ok(missing.some(i => i.field === `alibabaListing.packaging.${name}`));
  }
  const { saveAlibabaReview } = load("lib/alibaba-product-review.ts");
  let writes = 0;
  await assert.rejects(saveAlibabaReview({ product: { update: async () => { writes++; } } }, p, true), /包装/);
  assert.equal(writes, 0);
});

test("invalid measurements, inconsistent units, timelines and price precision are rejected", () => {
  for (const value of [-1, 0, Infinity, "20", true]) assert.throws(() => listing.parseAlibabaListing({ packaging: { lengthCm: value } }));
  assert.throws(() => listing.parseAlibabaListing({ salesUnit: "piece", piecesPerUnit: 8 }));
  assert.throws(() => listing.parseAlibabaListing({ salesUnit: "set", piecesPerUnit: 1 }));
  assert.throws(() => listing.parseAlibabaListing({ leadTimeMinDays: 45, leadTimeMaxDays: 30 }));
  assert.throws(() => listing.parseAlibabaListing({ packaging: { confirmed: "true" } }));
  assert.throws(() => listing.parseAlibabaListing({ packaging: { length: 20 } }));
  assert.throws(() => data.parseTiers([{ minQuantity: 50, unitPrice: 9.123 }]));
  assert.throws(() => data.parseTiers(Array.from({ length: 5 }, (_, i) => ({ minQuantity: i + 1, unitPrice: 9 }))));
});

test("Custom Lab persists the same structured fields, reports missing data and cannot approve", async t => {
  const previous = process.env.CUSTOM_LAB_API_KEY;
  process.env.CUSTOM_LAB_API_KEY = "test-only-intake-key";
  t.after(() => previous === undefined ? delete process.env.CUSTOM_LAB_API_KEY : process.env.CUSTOM_LAB_API_KEY = previous);
  let saved = null;
  const route = createLoader({ "@/lib/prisma": { prisma: { product: { create: async ({ data: input }) => {
    saved = { ...product(), ...input, alibabaApprovalHash: "", alibabaSyncEnabled: false }; return saved;
  } } } } })("app/api/custom-lab/products/route.ts");
  const request = (body, key = "test-only-intake-key") => new NextRequest("https://kelikuli.com/api/custom-lab/products", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify(body),
  });
  const payload = { name: "Test Resin Bobblehead Set", category: "Bobble Head Series", sku: "test-523", images: ["https://kelikuli.com/test.jpg"],
    description: "Test figurines for desk decoration.", alibabaCategoryId: "1720", alibabaDimensions: "13-15 cm",
    alibabaListing: complete(), alibabaPriceTiers: [{ minQuantity: 50, unitPrice: 72 }] };
  assert.equal((await route.POST(request(payload, "wrong"))).status, 401);
  assert.equal(saved, null);
  for (const forbidden of ["alibabaApprove", "alibabaSyncEnabled", "alibabaApprovalHash"]) {
    assert.equal((await route.POST(request({ ...payload, [forbidden]: true }))).status, 400);
  }
  assert.equal(saved, null);
  const response = await route.POST(request(payload));
  assert.equal(response.status, 201);
  assert.equal(saved.status, "inactive");
  assert.equal(saved.sku, "TEST-523");
  assert.equal(JSON.parse(saved.alibabaListing).packaging.lengthCm, 40);
  assert.equal(saved.alibabaApprovalHash, "");
  assert.equal((await response.json()).alibabaReadiness.dataComplete, true);
  payload.alibabaListing.packaging = {};
  const incomplete = await route.POST(request(payload));
  assert.equal(incomplete.status, 201);
  const result = await incomplete.json();
  assert.equal(result.alibabaReadiness.dataComplete, false);
  assert.ok(result.alibabaReadiness.missingFields.some(i => i.field.endsWith("grossWeightKg")));
});

test("GPT intake schema exposes the unit, package fields and unconfirmed state", () => {
  const schema = JSON.parse(readFileSync(new URL("../public/openapi/custom-lab-products.json", import.meta.url)));
  const props = schema.components.schemas.AlibabaListing.properties;
  assert.deepEqual(props.salesUnit.enum, ["", "piece", "set"]);
  assert.deepEqual(Object.keys(props.packaging.properties).sort(), ["confirmed", "grossWeightKg", "heightCm", "lengthCm", "widthCm"]);
  assert.ok(props.packaging.properties.lengthCm.type.includes("null"));
});

test("admin form renders explicit set packaging units without inventing numbers", async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const Component = load("app/admin/products/_alibaba-listing-fields.tsx").default;
  const unknown = listing.emptyAlibabaListing();
  unknown.salesUnit = "set"; unknown.piecesPerUnit = 8; unknown.minimumOrderQuantity = 50;
  const html = renderToStaticMarkup(React.createElement(Component, { value: unknown, categoryId: "1720", onChange: () => {} }));
  assert.match(html, /包装长（cm）/);
  assert.match(html, /包装毛重（kg）/);
  assert.match(html, /400/);
  assert.match(html, /待补充/);
  assert.doesNotMatch(html, /value="40"/);
});
