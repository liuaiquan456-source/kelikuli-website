import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canSyncAlibaba } from "@/lib/alibaba-actions-auth";
import { alibabaDraftStatus, syncAlibabaDraft } from "@/lib/alibaba-drafts";

export const runtime = "nodejs";
export const maxDuration = 90;
const headers = { "Cache-Control": "private, no-store" };

async function findProduct(sku: unknown) {
  if (typeof sku !== "string" || !/^[A-Z0-9][A-Z0-9._-]{0,63}$/i.test(sku.trim())) return null;
  return prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() }, select: { id: true } });
}

export async function GET(req: NextRequest) {
  if (!(await canSyncAlibaba(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const product = await findProduct(req.nextUrl.searchParams.get("sku"));
    if (!product) return NextResponse.json({ status: "not_found", message: "未找到 SKU，请在后台为产品设置唯一 SKU。" }, { status: 404, headers });
    return NextResponse.json(await alibabaDraftStatus(product.id), { headers });
  } catch { return NextResponse.json({ error: "无法读取同步状态。" }, { status: 503, headers }); }
}

export async function POST(req: NextRequest) {
  if (!(await canSyncAlibaba(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
    if (Object.keys(body).some(key => key !== "sku")) throw new Error();
  } catch { return NextResponse.json({ error: "请求仅接受 sku 字段。" }, { status: 400, headers }); }
  try {
    const product = await findProduct(body.sku);
    if (!product) return NextResponse.json({ status: "not_found", message: "未找到 SKU，请先完善产品资料。" }, { status: 404, headers });
    const result = await syncAlibabaDraft(product.id);
    const status = result.status === "draft" ? 200 : result.status === "syncing" ? 202 : result.status === "blocked" ? 422 : result.status === "uncertain" ? 409 : 503;
    return NextResponse.json(result, { status, headers });
  } catch { return NextResponse.json({ status: "failed", message: "暂时无法确认同步状态，请再次检查。" }, { status: 503, headers }); }
}
