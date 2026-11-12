import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { isAlibabaAdminOrigin } from "@/lib/alibaba-actions-auth";
import { beginAuthorization, configureConnection, connectionStatus, mutateConnection, readConnection, verifyConnection } from "@/lib/alibaba-connection";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(req: NextRequest) {
  if (!(await hasAdminSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try { return NextResponse.json(connectionStatus(await readConnection()), { headers }); }
  catch { return NextResponse.json({ error: "授权存储读取失败，请检查服务器配置。" }, { status: 503, headers }); }
}
export async function POST(req: NextRequest) {
  if (!isAlibabaAdminOrigin(req) || !(await hasAdminSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    if (Number(req.headers.get("content-length")) > 5000) throw new Error("配置内容过长。");
    let body;
    try { body = await req.json(); } catch { throw new Error("配置格式不正确。"); }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("配置格式不正确。");
    if (body.action === "configure") return NextResponse.json(await configureConnection(String(body.appKey ?? ""), String(body.appSecret ?? "")), { headers });
    if (body.action === "authorize") return NextResponse.json({ url: await beginAuthorization(req.cookies.get("admin_session")!.value) }, { headers });
    if (body.action === "verify") return NextResponse.json(await verifyConnection(), { headers });
    if (body.action === "automatic" && typeof body.enabled === "boolean") {
      const result = await mutateConnection(async c => {
        if (!c?.verifiedAt || !connectionStatus(c).connected) throw new Error("请先授权并验证店铺连接。");
        const next = { ...c, autoEnabled: body.enabled };
        return { connection: next, result: connectionStatus(next) };
      });
      return NextResponse.json(result, { headers });
    }
    return NextResponse.json({ error: "不支持的操作。" }, { status: 400, headers });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "连接操作失败。" }, { status: 400, headers }); }
}
