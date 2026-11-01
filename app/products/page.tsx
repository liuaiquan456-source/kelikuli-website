import type { Metadata } from "next";
import ProductsClient from "./_client";
import FaqSection from "@/components/FaqSection";
import { prisma } from "@/lib/prisma";
import { publicProductSelect, toPublicProduct } from "@/lib/public-products";

const baseMetadata: Metadata = {
  title: "Wholesale Resin Figurines — Products Catalog",
  description:
    "Browse wholesale resin figurines, blind box collectibles and seasonal Zakka crafts. OEM/ODM available — factory-direct from Kelikuli, Zhejiang China.",
  alternates: { canonical: "https://kelikuli.com/products" },
};

type Query = Promise<{ category?: string; page?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Query;
}): Promise<Metadata> {
  const { category, page } = await searchParams;
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (Number(page) > 1) params.set("page", String(Number(page)));
  return {
    ...baseMetadata,
    ...(category
      ? {
          title: `Wholesale ${category} — Custom Resin Products`,
          description: `Explore ${category.toLowerCase()} from Kelikuli. Discuss artwork, material, quantity, finish and packaging for your resin product project.`,
        }
      : {}),
    alternates: {
      canonical: `https://kelikuli.com/products${params.size ? `?${params}` : ""}`,
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Query;
}) {
  const { category, page } = await searchParams;
  const raw = await prisma.product.findMany({
    where: { status: "active" },
    select: publicProductSelect,
    orderBy: { createdAt: "desc" },
  });
  const products = raw.map(toPublicProduct);
  const count = category
    ? products.filter((product) => product.category === category).length
    : products.length;
  const currentPage = Math.min(
    Math.max(1, Math.floor(Number(page)) || 1),
    Math.max(1, Math.ceil(count / 24)),
  );
  return (
    <>
      <ProductsClient
        key={`${category}:${currentPage}`}
        initialProducts={products}
        initialCategory={category || "All Products"}
        initialPage={currentPage}
      />
      <FaqSection page="products" />
    </>
  );
}
