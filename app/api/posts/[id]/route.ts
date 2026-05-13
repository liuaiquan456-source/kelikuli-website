import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post: { ...post, relatedProducts: JSON.parse(post.relatedProducts) } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const current = await prisma.post.findUnique({ where: { id: Number(id) } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasPublished = current.status === "published";
  const nowPublished = body.status === "published";

  const { relatedProducts, ...restBody } = body;

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: {
      ...restBody,
      ...(relatedProducts !== undefined && { relatedProducts: JSON.stringify(relatedProducts) }),
      publishedAt: nowPublished && !wasPublished ? new Date() : current.publishedAt,
    },
  });
  return NextResponse.json({ post: { ...post, relatedProducts: JSON.parse(post.relatedProducts) } });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.post.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
