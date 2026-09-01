import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";

// Aggregated traffic figures for the "Traffic Sources" admin dashboard.
export async function GET(req: NextRequest) {
  if (!hasAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalVisits, todayVisits, last30, uniqueRows, bySourceRaw, byCountryRaw, byDeviceRaw] =
    await Promise.all([
      prisma.visit.count(),
      prisma.visit.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.visit.count({ where: { createdAt: { gte: start30 } } }),
      prisma.visit.groupBy({ by: ["ip"], _count: { _all: true } }),
      prisma.visit.groupBy({ by: ["source"], _count: { _all: true }, orderBy: { _count: { source: "desc" } } }),
      prisma.visit.groupBy({ by: ["country"], _count: { _all: true }, orderBy: { _count: { country: "desc" } } }),
      prisma.visit.groupBy({ by: ["device"], _count: { _all: true } }),
    ]);

  const bySource = bySourceRaw.map((r) => ({ source: r.source, visits: r._count._all }));
  const byCountry = byCountryRaw
    .filter((r) => r.country)
    .slice(0, 12)
    .map((r) => ({ country: r.country, visits: r._count._all }));
  const byDevice = { Desktop: 0, Mobile: 0, Tablet: 0 } as Record<string, number>;
  for (const r of byDeviceRaw) byDevice[r.device] = r._count._all;

  return NextResponse.json({
    totalVisits,
    todayVisits,
    last30Visits: last30,
    uniqueVisitors: uniqueRows.length,
    bySource,
    byCountry,
    byDevice,
  });
}
