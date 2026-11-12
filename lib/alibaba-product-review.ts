import type { Prisma, Product } from "@prisma/client";
import { draftContentHash, isAlibabaApproved, missingProductFields } from "./alibaba-draft-data";

// Called inside the same transaction that saves the reviewed product data.
export async function saveAlibabaReview(tx: Prisma.TransactionClient, product: Product, approve: unknown) {
  if (approve === true) {
    const missing = missingProductFields(product).filter(item => item.field !== "review");
    if (missing.length) throw Object.assign(new Error(missing.map(item => item.message).join(" ")), { name: "AlibabaReviewError" });
  }
  const hash = approve === true ? draftContentHash(product)
    : approve === false || !isAlibabaApproved(product) ? "" : product.alibabaApprovalHash;
  if (hash === product.alibabaApprovalHash) return product;
  return tx.product.update({ where: { id: product.id }, data: { alibabaApprovalHash: hash } });
}

export function productSaveError(error: unknown): { error: string; status: number } {
  if (error instanceof Error && error.name === "AlibabaReviewError") return { error: error.message, status: 422 };
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "P2002") return { error: "SKU 已存在，请使用唯一 SKU。", status: 409 };
    if (error.code === "P2025") return { error: "产品不存在。", status: 404 };
  }
  return { error: "产品保存失败，请检查资料后重试。", status: 500 };
}
