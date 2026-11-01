import assert from "node:assert/strict";
import { test } from "node:test";
import { createLoader } from "./load-ts.mjs";

test("robots permits public crawling without a database and names the sitemap", () => {
  const robots = createLoader()("app/robots.ts").default();
  assert.equal(robots.rules.userAgent, "*");
  assert.equal(robots.rules.allow, "/");
  assert.ok(robots.rules.disallow.includes("/admin"));
  assert.ok(robots.rules.disallow.includes("/api/"));
  assert.equal(robots.sitemap, "https://kelikuli.com/sitemap.xml");
});

test("sitemap includes omitted public pages, published records and truthful modification dates", async () => {
  const updatedAt = new Date("2026-10-01T00:00:00Z");
  const prisma = {
    product: { findMany: async (query) => {
      assert.equal(query.where.status, "active");
      return [{ id: 530, updatedAt }];
    } },
    post: { findMany: async (query) => {
      assert.equal(query.where.status, "published");
      return [{ slug: "resin-news", updatedAt }];
    } },
  };
  const sitemapModule = createLoader({ "@/lib/prisma": { prisma } })("app/sitemap.ts");
  assert.equal(sitemapModule.dynamic, "force-dynamic");
  const entries = await sitemapModule.default();
  const urls = entries.map((entry) => entry.url);
  for (const route of ["", "/products", "/custom-oem-odm", "/about-us", "/faq", "/contact", "/news", "/products/530", "/news/resin-news"]) {
    assert.ok(urls.includes(`https://kelikuli.com${route}`), route);
  }
  assert.equal(entries.find((entry) => entry.url.endsWith("/products/530")).lastModified, updatedAt);
  assert.equal(entries[0].lastModified, undefined);
});

test("database failure never becomes a successful incomplete sitemap", async () => {
  const prisma = {
    product: { findMany: async () => { throw new Error("DATABASE_UNAVAILABLE"); } },
    post: { findMany: async () => [] },
  };
  const { default: sitemap } = createLoader({ "@/lib/prisma": { prisma } })("app/sitemap.ts");
  await assert.rejects(sitemap(), /DATABASE_UNAVAILABLE/);
});
