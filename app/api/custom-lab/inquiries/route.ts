import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Read-only feed for the KELIKULI Custom Lab's own dashboard. Custom Lab
// pulls from here (e.g. on its "Refresh" button, or a periodic poll) rather
// than kelikuli.com pushing to it — that way a slow or unreachable Custom
// Lab backend can never slow down or break real customers submitting
// inquiries on kelikuli.com itself.
//
// Auth is a static shared secret, set via the CUSTOM_LAB_INQUIRIES_KEY env
// var, sent as `Authorization: Bearer <key>`. Read-only: nothing here can
// modify kelikuli.com's data.

const MAX_LIMIT = 200;

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CUSTOM_LAB_INQUIRIES_KEY;
  if (!expected) return false; // not configured on the server = closed, never open by default
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token.length > 0 && token === expected;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since"); // ISO datetime — only inquiries created after this
  const limitParam = parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, MAX_LIMIT) : MAX_LIMIT;

  let sinceDate: Date | undefined;
  if (since) {
    const parsed = new Date(since);
    if (!Number.isNaN(parsed.getTime())) sinceDate = parsed;
  }

  const inquiries = await prisma.inquiry.findMany({
    where: sinceDate ? { createdAt: { gt: sinceDate } } : undefined,
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const result = inquiries.map((i) => {
    let cartItems: unknown = [];
    try {
      cartItems = i.cartItems ? JSON.parse(i.cartItems) : [];
    } catch {
      cartItems = [];
    }
    return { ...i, cartItems };
  });

  return NextResponse.json({
    inquiries: result,
    count: result.length,
    // Pass this back as `since` on the next call to page forward incrementally.
    latestCreatedAt: result.length > 0 ? result[result.length - 1].createdAt : since ?? null,
  });
}
