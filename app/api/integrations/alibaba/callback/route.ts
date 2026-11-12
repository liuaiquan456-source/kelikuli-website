import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { finishAuthorization, verifyConnection } from "@/lib/alibaba-connection";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const destination = new URL("https://kelikuli.com/admin/alibaba");
  let result = "failed";
  try {
    const code = req.nextUrl.searchParams.get("code") ?? "", state = req.nextUrl.searchParams.get("state") ?? "";
    if (!code || code.length > 1000 || !state || state.length > 200 || !(await hasAdminSession(req))) throw new Error();
    await finishAuthorization(code, state, req.cookies.get("admin_session")!.value);
    result = "authorized";
    await verifyConnection();
    result = "connected";
  } catch { /* Never put authorization codes, upstream errors or tokens in URLs/logs. */ }
  destination.searchParams.set("result", result);
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
