import type { Metadata } from "next";
import { allProducts } from "@/data/products-data";
import ProductDetailClient from "./_client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: idStr } = await params;
  const product = allProducts.find((p) => p.id === parseInt(idStr, 10));
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — ${product.category} | Wholesale Resin Figurines`,
    description: `Buy wholesale ${product.name} from Kelikuli factory. Custom OEM/ODM resin ${product.category.toLowerCase()} — low MOQ, hand-painted, factory-direct from Zhejiang, China.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const product = allProducts.find((p) => p.id === parseInt(idStr, 10)) ?? null;
  return <ProductDetailClient product={product} />;
}
