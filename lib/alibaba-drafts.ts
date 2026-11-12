import { randomUUID } from "node:crypto";
import type { AlibabaDraft } from "@prisma/client";
import { prisma } from "./prisma";
import { draftContentHash, draftPayload, isAlibabaApproved, missingProductFields, type MissingField } from "./alibaba-draft-data";
import { gatewayConfig, gatewayRequest, missingConnectionFields, validateAtGateway, verifiedDraftId } from "./alibaba-gateway";

export interface SyncResult {
  status: "draft" | "blocked" | "syncing" | "uncertain" | "failed" | "not_found" | "disabled";
  message: string;
  draftId?: string;
  existing?: boolean;
  changedSinceSync?: boolean;
  missingFields?: MissingField[];
}

function draftReceipt(row: AlibabaDraft, contentHash: string): SyncResult {
  return { status: "draft", draftId: row.draftId!, existing: true,
    changedSinceSync: row.contentHash !== contentHash,
    message: row.contentHash === contentHash ? "已有国际站草稿，未重复提交。" : "已有国际站草稿。产品资料已修改，请在 My Alibaba 核对并更新已有草稿。" };
}

async function reconcile(row: AlibabaDraft, contentHash: string): Promise<SyncResult> {
  if (row.status === "syncing" && Date.now() - row.updatedAt.getTime() < 120_000) {
    return { status: "syncing", message: "草稿正在同步，请稍后检查。" };
  }
  // A timeout/crash is never permission to create another remote draft.
  await prisma.alibabaDraft.updateMany({ where: { productId: row.productId, status: "syncing" }, data: { status: "uncertain" } });
  try {
    const result = await gatewayRequest("/drafts/lookup", { sku: row.sku, idempotencyKey: row.idempotencyKey });
    const draftId = verifiedDraftId(result, row.sku, row.idempotencyKey);
    const saved = await prisma.alibabaDraft.update({ where: { productId: row.productId }, data: { status: "draft", draftId, message: "已核对并找回草稿编号。" } });
    return draftReceipt(saved, contentHash);
  } catch {
    return { status: "uncertain", message: "上次提交结果待核对。系统未再次创建草稿；请在 My Alibaba 或连接服务中核对，之后再次检查。" };
  }
}

export async function syncAlibabaDraft(productId: number, trigger: "manual" | "automatic" = "manual"): Promise<SyncResult> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { status: "not_found", message: "未找到该产品。" };
  const config = gatewayConfig();
  if (trigger === "automatic" && (!config.autoEnabled || !product.alibabaSyncEnabled || !isAlibabaApproved(product))) {
    return { status: "disabled", message: !config.autoEnabled ? "自动同步未启用。请先完成 PS01 草稿核验。" : "未勾选自动同步或资料尚未审核通过。" };
  }
  const contentHash = draftContentHash(product);
  let row = await prisma.alibabaDraft.findUnique({ where: { productId } });
  if (row && config.shopId && row.shopId !== config.shopId) return { status: "blocked", message: "已有同步记录属于另一店铺，请先核对店铺配置。" };
  if (row?.draftId) return draftReceipt(row, contentHash);
  if (row && ["syncing", "uncertain"].includes(row.status)) return reconcile(row, contentHash);

  const missingFields = [...missingProductFields(product), ...missingConnectionFields()];
  if (missingFields.length) return { status: "blocked", message: "资料或授权未齐全，尚未提交国际站。", missingFields };
  if (row) {
    const claim = await prisma.alibabaDraft.updateMany({
      where: { productId, status: "failed", updatedAt: row.updatedAt },
      data: { status: "syncing", contentHash, message: "" },
    });
    if (!claim.count) return { status: "syncing", message: "另一请求正在处理，请稍后检查。" };
    row = { ...row, status: "syncing", contentHash };
  } else {
    try {
      row = await prisma.alibabaDraft.create({ data: {
        productId, sku: product.sku!, shopId: config.shopId,
        idempotencyKey: randomUUID(), contentHash, status: "syncing",
      } });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        return { status: "syncing", message: "该产品或 SKU 已有同步请求，请稍后检查。" };
      }
      throw error;
    }
  }

  let validationToken: string;
  try {
    const validation = await validateAtGateway(draftPayload(product));
    if (validation.missingFields.length) {
      await prisma.alibabaDraft.update({ where: { productId }, data: { status: "failed", message: "国际站类目资料不完整。" } });
      return { status: "blocked", message: "国际站类目校验发现缺项，尚未提交草稿。", missingFields: validation.missingFields };
    }
    validationToken = validation.validationToken;
    // Don't submit a snapshot superseded or unapproved while validation ran.
    const latest = await prisma.product.findUnique({ where: { id: productId } });
    if (!latest || !isAlibabaApproved(latest) || draftContentHash(latest) !== contentHash ||
      (trigger === "automatic" && !latest.alibabaSyncEnabled)) throw new Error("产品资料或审核状态已改变，请重新检查。");
  } catch {
    await prisma.alibabaDraft.update({ where: { productId }, data: { status: "failed", message: "类目校验未完成或资料已修改，未创建草稿。" } });
    return { status: "failed", message: "类目校验未完成或资料已修改，未创建草稿。请检查连接与审核状态后重试。" };
  }

  try {
    const result = await gatewayRequest("/drafts", { sku: row.sku, idempotencyKey: row.idempotencyKey, validationToken });
    const draftId = verifiedDraftId(result, row.sku, row.idempotencyKey);
    await prisma.alibabaDraft.update({ where: { productId }, data: { status: "draft", draftId, message: "已保存到国际站草稿。" } });
    return { status: "draft", draftId, existing: false, changedSinceSync: false, message: "已保存到国际站草稿，请在 My Alibaba 核对图片、SKU、MOQ 和价格。" };
  } catch {
    await prisma.alibabaDraft.update({ where: { productId }, data: { status: "uncertain", message: "提交结果待核对，禁止自动重建。" } });
    return { status: "uncertain", message: "提交结果待核对，系统未重试创建。请再次检查以找回草稿编号，或在 My Alibaba 核对。" };
  }
}

export async function autoSyncAlibabaDraft(productId: number): Promise<SyncResult> {
  try { return await syncAlibabaDraft(productId, "automatic"); }
  catch { return { status: "failed", message: "产品已保存，但同步状态读取失败。请打开国际站草稿面板检查。" }; }
}

export async function alibabaDraftStatus(productId: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;
  const record = await prisma.alibabaDraft.findUnique({ where: { productId } });
  return {
    sku: product.sku, approved: isAlibabaApproved(product),
    autoEnabled: gatewayConfig().autoEnabled, optedIn: product.alibabaSyncEnabled,
    connectionConfigured: missingConnectionFields().length === 0,
    missingFields: [...missingProductFields(product), ...missingConnectionFields()],
    record: record ? { status: record.status, draftId: record.draftId, message: record.message,
      updatedAt: record.updatedAt, changedSinceSync: record.contentHash !== draftContentHash(product) } : null,
  };
}
