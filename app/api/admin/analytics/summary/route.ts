import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

// Aggregated traffic figures for the "Traffic Sources" admin dashboard.
// `since` (ISO datetime) and `source` narrow the breakdown sections
// (bySource/byCountry/byIp/byDevice/uniqueVisitors) to a time range and/or
// traffic source. totalVisits/todayVisits/last30Visits stay fixed reference
// numbers regardless of the filter, since their labels promise a fixed window.
export async function GET(req: NextRequest) {
  if (!hasAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const source = sp.get("source")?.trim() ?? "";
  const ip = sp.get("ip")?.trim() ?? "";
  const sinceParam = sp.get("since");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filterWhere: Prisma.VisitWhereInput = {};
  if (sinceParam) {
    const since = new Date(sinceParam);
    if (!Number.isNaN(since.getTime())) filterWhere.createdAt = { gte: since };
  }
  if (source && source !== "All") filterWhere.source = source;
  if (ip) filterWhere.ip = ip;

  const [
    totalVisits,
    todayVisits,
    last30,
    filteredTotal,
    uniqueRows,
    bySourceRaw,
    byCountryRaw,
    byDeviceRaw,
    byIpRaw,
  ] = await Promise.all([
    prisma.visit.count(),
    prisma.visit.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.visit.count({ where: { createdAt: { gte: start30 } } }),
    prisma.visit.count({ where: filterWhere }),
    prisma.visit.groupBy({ by: ["ip"], where: filterWhere, _count: { _all: true } }),
    prisma.visit.groupBy({ by: ["source"], where: filterWhere, _count: { _all: true }, orderBy: { _count: { source: "desc" } } }),
    prisma.visit.groupBy({ by: ["country"], where: filterWhere, _count: { _all: true }, orderBy: { _count: { country: "desc" } } }),
    prisma.visit.groupBy({ by: ["device"], where: filterWhere, _count: { _all: true } }),
    prisma.visit.groupBy({
      by: ["ip"],
      where: { ...filterWhere, NOT: { ip: "unknown" } },
      _count: { _all: true },
      orderBy: { _count: { ip: "desc" } },
      take: 10,
    }),
  ]);

  const bySource = bySourceRaw.map((r) => ({ source: r.source, visits: r._count._all }));
  const byCountry = byCountryRaw
    .filter((r) => r.country)
    .slice(0, 12)
    .map((r) => ({ country: r.country, visits: r._count._all }));
  const byIp = byIpRaw.map((r) => ({ ip: r.ip, visits: r._count._all }));
  const byDevice = { Desktop: 0, Mobile: 0, Tablet: 0 } as Record<string, number>;
  for (const r of byDeviceRaw) byDevice[r.device] = r._count._all;

  return NextResponse.json({
    totalVisits,
    todayVisits,
    last30Visits: last30,
    filteredTotal,
    uniqueVisitors: uniqueRows.length,
    bySource,
    byCountry,
    byIp,
    byDevice,
  });
}
