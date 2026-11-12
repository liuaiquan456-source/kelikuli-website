import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { alibabaProductInput, isAlibabaApproved } from "@/lib/alibaba-draft-data";
import { saveAlibabaReview, productSaveError } from "@/lib/alibaba-product-review";
import { autoPublishAlibabaProduct } from "@/lib/alibaba-publishing";
import { parseProductId } from "@/lib/public-products";

export const maxDuration = 90;

const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
  }
  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) return NextResponse.json({ error: "Invalid product id" }, { status: 400, headers: privateHeaders });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...product,
    alibabaApproved: isAlibabaApproved(product),
    tags: JSON.parse(product.tags),
    images: JSON.parse(product.images ?? "[]"),
    variants: JSON.parse(product.variants ?? "[]"),
  }, { headers: privateHeaders });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
  }
  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) return NextResponse.json({ error: "Invalid product id" }, { status: 400, headers: privateHeaders });
  let body;
  let alibabaData;
  try {
    body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("产品资料格式不正确。");
    alibabaData = alibabaProductInput(body);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid product data" }, { status: 400, headers: privateHeaders });
  }
  try {
    const product = await prisma.$transaction(async (tx) => {
      if (alibabaData.sku !== undefined) {
        const receipt = await tx.alibabaDraft.findUnique({ where: { productId } });
        if (receipt && alibabaData.sku !== receipt.sku) throw new Error("SKU_LOCKED");
      }
      const saved = await tx.product.update({
        where: { id: productId },
        data: {
          ...alibabaData,
          ...(body.name        !== undefined && { name:        body.name }),
          ...(body.category    !== undefined && { category:    body.category }),
          ...(body.price       !== undefined && { price:       parseFloat(body.price) || 0 }),
          ...(body.stock       !== undefined && { stock:       parseInt(body.stock) || 0 }),
          ...(body.moq         !== undefined && { moq:         parseInt(body.moq) }),
          ...(body.leadTime    !== undefined && { leadTime:    body.leadTime }),
          ...(body.status      !== undefined && { status:      typeof body.status === "boolean" ? (body.status ? "active" : "inactive") : body.status }),
          ...(body.image       !== undefined && { image:       body.image }),
          ...(body.images      !== undefined && { images:      JSON.stringify(body.images) }),
          ...(body.video       !== undefined && { video:       body.video }),
          ...(body.tags        !== undefined && { tags:        JSON.stringify(body.tags) }),
          ...(body.variants    !== undefined && { variants:    JSON.stringify(body.variants) }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.specs       !== undefined && { specs:       body.specs }),
          ...(body.seoTitle    !== undefined && { seoTitle:    body.seoTitle }),
          ...(body.seoDesc     !== undefined && { seoDesc:     body.seoDesc }),
          ...(body.seoKeywords !== undefined && { seoKeywords: body.seoKeywords }),
        },
      });
      return saveAlibabaReview(tx, saved, body.alibabaApprove);
    });
    const alibabaSync = product.alibabaSyncEnabled ? await autoPublishAlibabaProduct(product.id) : undefined;
    return NextResponse.json({
      ...product,
      alibabaApproved: isAlibabaApproved(product),
      alibabaSync,
      tags: JSON.parse(product.tags),
      images: JSON.parse(product.images ?? "[]"),
      variants: JSON.parse(product.variants ?? "[]"),
    }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof Error && error.message === "SKU_LOCKED") return NextResponse.json({ error: "该产品已有国际站同步记录，SKU 不可修改。" }, { status: 409, headers: privateHeaders });
    const failure = productSaveError(error);
    return NextResponse.json({ error: failure.error }, { status: failure.status, headers: privateHeaders });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
  }
  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) return NextResponse.json({ error: "Invalid product id" }, { status: 400, headers: privateHeaders });
  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") return NextResponse.json({ error: "该产品已有国际站同步记录，请保留记录并将产品设为 Draft。" }, { status: 409, headers: privateHeaders });
    const failure = productSaveError(error);
    return NextResponse.json({ error: failure.error }, { status: failure.status, headers: privateHeaders });
  }
  return NextResponse.json({ success: true });
}
