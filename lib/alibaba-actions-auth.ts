import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { hasAdminSession } from "./admin-auth";

export function isAlibabaAdminOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  // Next's internal request origin may be localhost behind the production proxy.
  return origin === "https://kelikuli.com" || (process.env.NODE_ENV !== "production" && origin === req.nextUrl.origin);
}

export async function canSyncAlibaba(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (auth) {
    const expected = process.env.KELIKULI_ACTIONS_KEY ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (expected.length < 32 || Buffer.byteLength(token) !== Buffer.byteLength(expected)) return false;
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  }
  const origin = req.headers.get("origin");
  if (origin && !isAlibabaAdminOrigin(req)) return false;
  return hasAdminSession(req);
}
