import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const publishedOnly = searchParams.get("published") === "true";

  const posts = await prisma.post.findMany({
    where: publishedOnly ? { status: "published" } : undefined,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, slug: true, title: true, category: true,
      excerpt: true, image: true, status: true, publishedAt: true, createdAt: true,
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, slug, category, excerpt, content, image, status, relatedProducts } = body;

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      title:          title.trim(),
      slug:           slug.trim(),
      category:       category ?? "Industry Insights",
      excerpt:        excerpt?.trim() ?? "",
      content:        content?.trim() ?? "",
      image:          image?.trim() ?? "",
      status:         status ?? "draft",
      relatedProducts: JSON.stringify(relatedProducts ?? []),
      publishedAt:    status === "published" ? new Date() : null,
    },
  });
  return NextResponse.json({ post: { ...post, relatedProducts: JSON.parse(post.relatedProducts) } }, { status: 201 });
}
