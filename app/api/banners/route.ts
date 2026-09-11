import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";

// Public homepage carousel banners (the plain "poster" slides — see HeroCarousel).
export async function GET(req: NextRequest) {
  const activeOnly = req.nextUrl.searchParams.get("active") === "true";
  const banners = await prisma.banner.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  if (!hasAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { image, link, alt, title, subtitle } = body;
  if (!image?.trim()) {
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  }

  const last = await prisma.banner.findFirst({ orderBy: { sortOrder: "desc" } });
  const banner = await prisma.banner.create({
    data: {
      image: image.trim(),
      link: link?.trim() ?? "",
      alt: alt?.trim() ?? "",
      title: title?.trim() ?? "",
      subtitle: subtitle?.trim() ?? "",
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  return NextResponse.json(banner, { status: 201 });
}
