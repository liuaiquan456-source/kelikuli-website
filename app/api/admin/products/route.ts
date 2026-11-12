import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { alibabaProductInput } from "@/lib/alibaba-draft-data";
import { saveAlibabaReview, productSaveError } from "@/lib/alibaba-product-review";
import { autoSyncAlibabaDraft } from "@/lib/alibaba-drafts";

export const maxDuration = 90;

const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest) {
  if (!(await hasAdminSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
  }
  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")   ?? "";
  const category = searchParams.get("category") ?? "";
  const status   = searchParams.get("status")   ?? "";

  const products = await prisma.product.findMany({
    where: {
      AND: [
        search   ? { OR: [{ name: { contains: search } }, { sku: { contains: search.toUpperCase() } }] } : {},
        category ? { category: { equals:   category  } } : {},
        status   ? { status:   { equals:   status    } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const result = products.map((p) => ({
    ...p,
    tags: JSON.parse(p.tags) as string[],
    images: JSON.parse(p.images ?? "[]") as string[],
    variants: JSON.parse(p.variants ?? "[]"),
  }));

  return NextResponse.json(result, { headers: privateHeaders });
}

export async function POST(req: NextRequest) {
  if (!(await hasAdminSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
  }
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
      const saved = await tx.product.create({
        data: {
          ...alibabaData,
          name:        body.name,
          category:    body.category,
          price:       parseFloat(body.price) || 0,
          stock:       parseInt(body.stock) || 0,
          moq:         parseInt(body.moq ?? "50"),
          leadTime:    body.leadTime ?? "30-45 days",
          status:      body.status ? "active" : "inactive",
          image:       body.image ?? "",
          images:      JSON.stringify(body.images ?? []),
          video:       body.video ?? "",
          tags:        JSON.stringify(body.tags ?? []),
          variants:    JSON.stringify(body.variants ?? []),
          description: body.description ?? "",
          specs:       body.specs ?? "",
          seoTitle:    body.seoTitle ?? "",
          seoDesc:     body.seoDesc ?? "",
          seoKeywords: body.seoKeywords ?? "",
        },
      });
      return saveAlibabaReview(tx, saved, body.alibabaApprove);
    });
    const alibabaSync = product.alibabaSyncEnabled ? await autoSyncAlibabaDraft(product.id) : undefined;
    return NextResponse.json({ ...product, tags: JSON.parse(product.tags), alibabaSync }, { status: 201, headers: privateHeaders });
  } catch (error) {
    const failure = productSaveError(error);
    return NextResponse.json({ error: failure.error }, { status: failure.status, headers: privateHeaders });
  }
}
