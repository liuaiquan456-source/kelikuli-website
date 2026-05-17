import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...product,
    tags: JSON.parse(product.tags),
    images: JSON.parse(product.images ?? "[]"),
    variants: JSON.parse(product.variants ?? "[]"),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.name        !== undefined && { name:        body.name }),
      ...(body.category    !== undefined && { category:    body.category }),
      ...(body.price       !== undefined && { price:       parseFloat(body.price) || 0 }),
      ...(body.stock       !== undefined && { stock:       parseInt(body.stock) || 0 }),
      ...(body.moq         !== undefined && { moq:         parseInt(body.moq) }),
      ...(body.leadTime    !== undefined && { leadTime:    body.leadTime }),
      ...(body.status      !== undefined && { status:      typeof body.status === "boolean" ? (body.status ? "active" : "inactive") : body.status }),
      ...(body.image       !== undefined && { image:       body.image }),
      ...(body.images      !== undefined && { images:      JSON.stringify(body.images) }),
      ...(body.tags        !== undefined && { tags:        JSON.stringify(body.tags) }),
      ...(body.variants    !== undefined && { variants:    JSON.stringify(body.variants) }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.specs       !== undefined && { specs:       body.specs }),
      ...(body.seoTitle    !== undefined && { seoTitle:    body.seoTitle }),
      ...(body.seoDesc     !== undefined && { seoDesc:     body.seoDesc }),
      ...(body.seoKeywords !== undefined && { seoKeywords: body.seoKeywords }),
    },
  });
  return NextResponse.json({
    ...product,
    tags: JSON.parse(product.tags),
    images: JSON.parse(product.images ?? "[]"),
    variants: JSON.parse(product.variants ?? "[]"),
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
