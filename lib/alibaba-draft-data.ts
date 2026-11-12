import { createHash } from "node:crypto";
import { parseAlibabaListing, readAlibabaListing, missingListingFields } from "./alibaba-listing";

export const DRAFT_METHOD = "alibaba.icbu.product.schema.add.draft";
export interface PriceTier { minQuantity: number; unitPrice: number }
export interface DraftProduct {
  id: number; sku: string | null; name: string; image: string; images: string;
  description: string; moq: number; leadTime: string;
  alibabaCategoryId: string; alibabaDimensions: string; alibabaPriceTiers: string;
  alibabaListing?: string;
  alibabaSyncEnabled: boolean; alibabaApprovalHash: string;
}
export interface MissingField { field: string; message: string }

export function parseTiers(raw: unknown): PriceTier[] {
  const value: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!Array.isArray(value) || value.length > 4) throw new Error("阶梯价必须是最多 4 行的数组。");
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("阶梯价格式不正确。");
    const { minQuantity, unitPrice } = item as PriceTier;
    if (!Number.isSafeInteger(minQuantity) || minQuantity <= 0 ||
      typeof unitPrice !== "number" || !Number.isFinite(unitPrice) || unitPrice < 0.01 || unitPrice > 9999999.99 ||
      Math.abs(Math.round(unitPrice * 100) - unitPrice * 100) > 0.000001) {
      throw new Error("阶梯价数量必须为正整数，USD 单价至少 0.01，最多两位小数。");
    }
    return { minQuantity, unitPrice };
  });
}

function productImages(product: DraftProduct): string[] {
  let images: unknown = [];
  try { images = JSON.parse(product.images); } catch { /* reported as missing below */ }
  return [...new Set([product.image, ...(Array.isArray(images) ? images : [])])]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function draftPayload(product: DraftProduct) {
  let priceTiers: PriceTier[] = [];
  try { priceTiers = parseTiers(product.alibabaPriceTiers); } catch { /* validator reports it */ }
  const listing = readAlibabaListing(product.alibabaListing);
  return {
    productId: product.id, sku: product.sku ?? "", title: product.name.trim(),
    categoryId: product.alibabaCategoryId.trim(), language: "en_US", currency: "USD",
    images: productImages(product), dimensions: product.alibabaDimensions.trim(),
    moq: listing.minimumOrderQuantity, websiteMoq: product.moq, priceTiers, description: product.description.trim(),
    leadTime: product.leadTime.trim(),
    listing,
  };
}

export function draftContentHash(product: DraftProduct): string {
  return createHash("sha256").update(JSON.stringify(draftPayload(product))).digest("hex");
}

export function isAlibabaApproved(product: DraftProduct): boolean {
  return !!product.alibabaApprovalHash && product.alibabaApprovalHash === draftContentHash(product);
}

export function missingProductFields(product: DraftProduct): MissingField[] {
  const p = draftPayload(product);
  const missing: MissingField[] = [];
  const add = (field: string, message: string) => missing.push({ field, message });
  if (!/^[A-Z0-9][A-Z0-9._-]{0,63}$/.test(p.sku)) add("sku", "请填写唯一 SKU，例如 PS01。");
  if (!/[A-Za-z]/.test(p.title) || /[\u3400-\u9fff]/.test(p.title) || Buffer.byteLength(p.title) > 128) add("name", "请填写英文产品标题（最多 128 字节）。");
  if (!/^[1-9]\d*$/.test(p.categoryId)) add("alibabaCategoryId", "请选择国际站末级类目 ID。");
  if (!p.images.length) add("images", "请上传产品图片。");
  p.images.forEach((src, index) => {
    try {
      const url = new URL(src.startsWith("/") && !src.startsWith("//") ? `https://kelikuli.com${src}` : src);
      if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") ||
        /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) ||
        url.hostname.endsWith(".local")) throw new Error();
    } catch { add(`images.${index}`, "图片必须是可公开访问的 HTTPS 地址或本站图片路径。"); }
  });
  if (!p.dimensions) add("alibabaDimensions", "请填写产品尺寸及单位。");
  missing.push(...missingListingFields(p.listing, p.categoryId));
  if (!p.priceTiers.length) add("alibabaPriceTiers", "请填写经确认的 USD 阶梯价。");
  else {
    if (p.priceTiers[0].minQuantity !== p.moq) add("alibabaPriceTiers", "第一档起订量须与国际站 MOQ 一致，均按所选销售单位计算。");
    if (p.priceTiers.some((tier, i) => i > 0 && tier.minQuantity <= p.priceTiers[i - 1].minQuantity)) {
      add("alibabaPriceTiers", "阶梯起订量必须按升序填写且不能重复。");
    }
  }
  if (!/[A-Za-z]/.test(p.description) || /[\u3400-\u9fff]/.test(p.description)) add("description", "请填写英文产品详情。");
  if (!p.leadTime) add("leadTime", "请填写交货期。");
  if (!isAlibabaApproved(product)) add("review", "产品资料尚未审核通过，或审核后已修改。");
  return missing;
}

// Shared data parser. Intake can submit these facts, but cannot approve or enable sync.
export function alibabaProductInput(body: Record<string, unknown>) {
  const data: {
    sku?: string | null; alibabaCategoryId?: string; alibabaDimensions?: string;
    alibabaPriceTiers?: string; alibabaSyncEnabled?: boolean;
    alibabaListing?: string;
  } = {};
  if (body.sku !== undefined) {
    if (typeof body.sku !== "string") throw new Error("SKU 格式不正确。");
    const sku = body.sku.trim().toUpperCase();
    if (sku && !/^[A-Z0-9][A-Z0-9._-]{0,63}$/.test(sku)) throw new Error("SKU 仅支持字母、数字、点、横线和下划线，最多 64 字符。");
    data.sku = sku || null;
  }
  for (const key of ["alibabaCategoryId", "alibabaDimensions"] as const) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== "string" || body[key].length > 500) throw new Error("国际站资料格式不正确。");
      data[key] = body[key].trim();
    }
  }
  if (body.alibabaPriceTiers !== undefined) data.alibabaPriceTiers = JSON.stringify(parseTiers(body.alibabaPriceTiers));
  if (body.alibabaListing !== undefined) data.alibabaListing = JSON.stringify(parseAlibabaListing(body.alibabaListing));
  if (body.alibabaSyncEnabled !== undefined) {
    if (typeof body.alibabaSyncEnabled !== "boolean") throw new Error("同步开关格式不正确。");
    data.alibabaSyncEnabled = body.alibabaSyncEnabled;
  }
  if (body.alibabaApprove !== undefined && typeof body.alibabaApprove !== "boolean") throw new Error("审核状态格式不正确。");
  return data;
}
