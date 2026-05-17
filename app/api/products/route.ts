import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")   ?? "";
  const category = searchParams.get("category") ?? "";
  const status   = searchParams.get("status")   ?? "";

  const products = await prisma.product.findMany({
    where: {
      AND: [
        search   ? { name:     { contains: search,   } } : {},
        category ? { category: { equals:   category  } } : {},
        status   ? { status:   { equals:   status    } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const result = products.map((p) => ({
    ...p,
    tags: JSON.parse(p.tags) as string[],
    images: JSON.parse(p.images ?? "[]") as string[],
    variants: JSON.parse(p.variants ?? "[]"),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name:        body.name,
      category:    body.category,
      price:       parseFloat(body.price) || 0,
      stock:       parseInt(body.stock) || 0,
      moq:         parseInt(body.moq ?? "50"),
      leadTime:    body.leadTime ?? "30-45 days",
      status:      body.status ? "active" : "inactive",
      image:       body.image ?? "",
      images:      JSON.stringify(body.images ?? []),
      tags:        JSON.stringify(body.tags ?? []),
      variants:    JSON.stringify(body.variants ?? []),
      description: body.description ?? "",
      specs:       body.specs ?? "",
      seoTitle:    body.seoTitle ?? "",
      seoDesc:     body.seoDesc ?? "",
      seoKeywords: body.seoKeywords ?? "",
    },
  });
  return NextResponse.json({ ...product, tags: JSON.parse(product.tags) }, { status: 201 });
}
