import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseProductId, publicProductSelect, toPublicProduct } from "@/lib/public-products";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseProductId((await params).id);
  const product = id === null ? null : await prisma.product.findFirst({
    where: { id, status: "active" },
    select: publicProductSelect,
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toPublicProduct(product), {
    headers: { "Cache-Control": "no-store" },
  });
}
