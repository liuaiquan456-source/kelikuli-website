import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicProductSelect, toPublicProduct } from "@/lib/public-products";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      ...(search ? { name: { contains: search } } : {}),
      ...(category ? { category } : {}),
    },
    select: publicProductSelect,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products.map(toPublicProduct), {
    headers: { "Cache-Control": "no-store" },
  });
}
