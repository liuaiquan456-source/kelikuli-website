import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

// Paginated raw visit log for the "IP Logs" and "Traffic Sources" admin views.
export async function GET(req: NextRequest) {
  if (!hasAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const limit = Math.min(500, Math.max(1, Number(sp.get("limit") ?? "100")));

  const ip = sp.get("ip")?.trim() ?? "";
  const country = sp.get("country")?.trim() ?? "";
  const source = sp.get("source")?.trim() ?? "";
  const device = sp.get("device")?.trim() ?? "";
  const keyword = sp.get("keyword")?.trim() ?? "";
  const q = sp.get("q")?.trim() ?? "";

  const where: Prisma.VisitWhereInput = {};
  if (ip) where.ip = { contains: ip, mode: "insensitive" };
  if (country) where.country = { contains: country, mode: "insensitive" };
  if (source && source !== "All") where.source = source;
  if (device && device !== "All") where.device = device;
  if (keyword) where.keyword = { contains: keyword, mode: "insensitive" };
  if (q) where.path = { contains: q, mode: "insensitive" };

  const [total, visits] = await Promise.all([
    prisma.visit.count({ where }),
    prisma.visit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ visits, total, page, limit });
}
