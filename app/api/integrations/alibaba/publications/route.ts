import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canSyncAlibaba } from "@/lib/alibaba-actions-auth";
import { alibabaPublicationStatus, publishAlibabaProduct, productSchemaFields } from "@/lib/alibaba-publishing";
export const runtime = "nodejs";
export const maxDuration = 300;
const headers = { "Cache-Control": "private, no-store" };
async function productForSku(sku: unknown) {
  if (typeof sku !== "string" || !/^[A-Z0-9][A-Z0-9._-]{0,63}$/i.test(sku)) return null;
  return prisma.product.findUnique({ where: { sku: sku.toUpperCase() }, select: { id: true } });
}
export async function GET(req: NextRequest) {
  if (!(await canSyncAlibaba(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const product = await productForSku(req.nextUrl.searchParams.get("sku"));
    if (!product) return NextResponse.json({ error: "请先保存商品和 SKU。" }, { status: 404, headers });
    return NextResponse.json(req.nextUrl.searchParams.get("schema") === "true" ? await productSchemaFields(product.id) : await alibabaPublicationStatus(product.id), { headers });
  } catch { return NextResponse.json({ error: "无法读取国际站状态或类目规则，请先检查连接和已保存的类目 ID。" }, { status: 503, headers }); }
}
export async function POST(req: NextRequest) {
  if (!(await canSyncAlibaba(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Object.keys(body).some(k => k !== "sku")) return NextResponse.json({ error: "仅接受 sku 字段。" }, { status: 400, headers });
    const product = await productForSku(body.sku);
    if (!product) return NextResponse.json({ error: "未找到商品。" }, { status: 404, headers });
    const result = await publishAlibabaProduct(product.id);
    const code = { submitted: 200, syncing: 202, blocked: 422, uncertain: 409, failed: 503, disabled: 409, not_found: 404 }[result.status];
    return NextResponse.json(result, { status: code, headers });
  } catch { return NextResponse.json({ status: "failed", message: "暂时无法确认提交状态，请先检查同步记录，勿重复新建商品。" }, { status: 503, headers }); }
}
