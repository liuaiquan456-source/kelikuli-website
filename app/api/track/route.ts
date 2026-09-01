import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  clientIpFrom,
  detectDevice,
  detectSource,
  extractKeyword,
  isBot,
  lookupGeo,
} from "@/lib/analytics";

const ok = () => NextResponse.json({ ok: true });

// Public endpoint hit by the client-side <VisitTracker> beacon on every page view.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { path?: string; referer?: string };
    const path = typeof body.path === "string" ? body.path : "";

    if (!path || !path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
      return ok();
    }

    const ua = req.headers.get("user-agent") || "";
    if (isBot(ua)) return ok();

    const referer = typeof body.referer === "string" ? body.referer : "";
    const ip = clientIpFrom(req.headers);
    const host = req.headers.get("host") || "";
    const source = detectSource(referer, host);
    const keyword = extractKeyword(referer);
    const device = detectDevice(ua);

    // Reuse a recent geo lookup for the same IP to stay well under the
    // free ip-api.com rate limit.
    let geo = { country: "", countryCode: "", region: "", city: "" };
    if (ip) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const prior = await prisma.visit.findFirst({
        where: { ip, createdAt: { gte: since }, NOT: { country: "" } },
        orderBy: { createdAt: "desc" },
        select: { country: true, countryCode: true, region: true, city: true },
      });
      geo = prior ?? (await lookupGeo(ip));
    }

    await prisma.visit.create({
      data: {
        ip: ip || "unknown",
        country: geo.country,
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        path: path.slice(0, 512),
        referer: referer.slice(0, 1024),
        source,
        keyword: keyword.slice(0, 256),
        device,
        userAgent: ua.slice(0, 512),
      },
    });

    return ok();
  } catch {
    // Never surface tracking failures to the visitor.
    return ok();
  }
}
