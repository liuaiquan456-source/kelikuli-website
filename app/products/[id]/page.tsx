import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./_client";

async function getProduct(id: number) {
  try {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return null;
    return { ...p, tags: JSON.parse(p.tags) as string[] };
  } catch {
    return null;
  }
}

async function getRelated(category: string, excludeId: number) {
  try {
    const list = await prisma.product.findMany({
      where: { category, status: "active", NOT: { id: excludeId } },
      take: 4,
    });
    return list.map((p) => ({ ...p, tags: JSON.parse(p.tags) as string[] }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: idStr } = await params;
  const product = await getProduct(parseInt(idStr, 10));
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
  const id = parseInt(idStr, 10);
  const product = await getProduct(id);
  const related = product ? await getRelated(product.category, id) : [];
  return <ProductDetailClient product={product} related={related} />;
}
