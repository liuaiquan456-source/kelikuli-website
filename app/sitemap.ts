import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://kelikuli.com";

// Never cache a partial sitemap produced by a build-time database outage.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/custom-oem-odm`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/about-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/news`, changeFrequency: "daily", priority: 0.7 },
  ];

  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active" },
      select: { id: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const newsRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/news/${encodeURIComponent(post.slug)}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...newsRoutes];
}
