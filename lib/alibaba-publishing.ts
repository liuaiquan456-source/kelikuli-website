import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./prisma";
import { AlibabaApiError, callAlibaba } from "./alibaba-client";
import { authorizedConnection, connectionStatus, readConnection, type AlibabaConnection } from "./alibaba-connection";
import { draftContentHash, draftPayload, isAlibabaApproved, missingProductFields, type MissingField } from "./alibaba-draft-data";
import { compileAlibabaSchema, parseAlibabaSchema, type AlibabaPhoto } from "./alibaba-schema";

export interface PublishResult {
  status: "submitted" | "blocked" | "syncing" | "uncertain" | "failed" | "not_found" | "disabled";
  message: string; productId?: string; existing?: boolean; changedSinceSync?: boolean; missingFields?: MissingField[];
}
export async function fetchPublishSchema(categoryId: string, c: AlibabaConnection) {
  if (!/^[1-9]\d*$/.test(categoryId)) throw new Error("请先填写国际站末级类目 ID。");
  const result = await callAlibaba("alibaba.icbu.product.schema.get", { param_product_top_publish_request: JSON.stringify({ cat_id: categoryId, language: "en_US", publish_type: "default" }) }, c);
  if (!(result.biz_success === true || result.biz_success === "true") || typeof result.data !== "string") throw new AlibabaApiError(String(result.msg_code ?? "SCHEMA_FAILED").replace(/[^A-Z0-9_.;-]/gi, "").slice(0, 100));
  return parseAlibabaSchema(result.data);
}
export async function productSchemaFields(productId: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("商品不存在。");
  const payload = draftPayload(product), fields = await fetchPublishSchema(payload.categoryId, await authorizedConnection());
  const result = compileAlibabaSchema(fields, payload, payload.images.map((url, i) => ({ id: String(i + 1), url })));
  return { missingFields: result.missingFields, fields: result.supplemental };
}
export function allowedImageUrl(src: string) {
  const url = new URL(src, "https://kelikuli.com");
  if (url.protocol !== "https:" || url.username || url.password || url.port ||
    !["kelikuli.com", "www.kelikuli.com", "custom.kelikuli.com"].includes(url.hostname)) throw new Error("请先将产品图片上传到 KELIKULI 官网，再同步国际站。");
  return url;
}
async function uploadPhoto(src: string, c: AlibabaConnection): Promise<AlibabaPhoto> {
  const url = allowedImageUrl(src);
  const response = await fetch(url, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(20_000) });
  if (!response.ok || !response.body || Number(response.headers.get("content-length")) > 5 * 1024 * 1024) throw new Error("产品图片不可读取或超过 5MB。");
  const reader = response.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  try { for (;;) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.length; if (size > 5 * 1024 * 1024) throw new Error("产品图片超过 5MB。"); chunks.push(chunk.value); } }
  finally { await reader.cancel().catch(() => {}); }
  const bytes = Buffer.concat(chunks);
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (!isJpeg && !isPng) throw new Error("国际站主图请使用 JPG 或 PNG 图片。");
  const hash = createHash("sha256").update(`${c.appKey}:${c.shopId}:`).update(bytes).digest("hex");
  const directory = path.join(process.env.ALIBABA_PRIVATE_DIR || path.join(process.cwd(), "private", "alibaba"), "photos");
  const filename = path.join(directory, `${hash}.json`);
  try { const saved = JSON.parse(await readFile(filename, "utf8")); if (/^\d+$/.test(saved.id) && /^https:\/\/[a-z0-9.-]+\.alicdn\.com\//i.test(saved.url)) return saved; } catch { /* cache miss */ }
  const name = `${hash.slice(0, 20)}.${isJpeg ? "jpg" : "png"}`;
  const result = await callAlibaba("alibaba.icbu.photobank.upload", { file_name: name }, c, { bytes, name, mime: isJpeg ? "image/jpeg" : "image/png" });
  const photo = result.upload_image_response as Record<string, unknown> | undefined;
  const image = { id: String(photo?.file_id ?? ""), url: String(photo?.photobank_url ?? "").replace(/^http:/, "https:") };
  if (!/^\d+$/.test(image.id) || !/^https:\/\/[a-z0-9.-]+\.alicdn\.com\//i.test(image.url)) throw new Error("国际站未返回有效的图片银行编号。");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporary = filename + "." + randomUUID();
  await writeFile(temporary, JSON.stringify(image), { mode: 0o600 }); await rename(temporary, filename);
  return image;
}
function safeMessage(error: unknown) {
  if (error instanceof AlibabaApiError) return error.message;
  // Controlled errors are useful; fetch/filesystem exceptions may contain URLs.
  const known = ["产品图片", "国际站未返回", "请先", "授权", "店铺", "商品资料", "国际站没有", "国际站类目", "类目", "国际站主图"];
  return error instanceof Error && known.some(prefix => error.message.startsWith(prefix)) ? error.message : "国际站请求未完成，请检查连接后重试。";
}
export async function publishAlibabaProduct(productId: number, trigger: "manual" | "automatic" = "manual"): Promise<PublishResult> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { status: "not_found", message: "商品不存在。" };
  const connection = await readConnection();
  if (trigger === "automatic" && (!connection?.autoEnabled || !product.alibabaSyncEnabled || !isAlibabaApproved(product))) return { status: "disabled", message: "产品已保存；自动发布未开启，或本款资料尚未确认。" };
  const hash = draftContentHash(product);
  let record = await prisma.alibabaDraft.findUnique({ where: { productId } });
  if (record && connection?.shopId && record.shopId !== connection.shopId) return { status: "blocked", message: "此商品已有另一店铺的同步记录，请核对店铺。" };
  if (record?.status === "submitted" && record.draftId) return { status: "submitted", productId: record.draftId, existing: true, changedSinceSync: record.contentHash !== hash,
    message: record.contentHash === hash ? "已提交国际站审核，未重复发布。" : "已提交过此商品。官网资料已变更，请在国际站已有商品中核对更新，系统不会重复新建。" };
  if (record?.draftId) return { status: "blocked", message: "已有国际站草稿，请先在 My Alibaba 核对，不能重复新建商品。" };
  if (record && ["submitting", "uncertain", "syncing"].includes(record.status)) return { status: "uncertain", message: "上次请求可能已提交，请在 My Alibaba 核对。系统不会自动重复创建商品。" };
  if (record?.status === "preparing" && Date.now() - record.updatedAt.getTime() < 300_000) return { status: "syncing", message: "正在读取类目和上传图片，请稍后检查。" };
  const missingFields = missingProductFields(product);
  if (!connectionStatus(connection).connected) missingFields.push({ field: "connection", message: "请在国际站自动发布页面授权并验证店铺。" });
  if (missingFields.length) return { status: "blocked", message: "资料或授权未齐全，尚未提交国际站。", missingFields };
  const c = await authorizedConnection();
  if (record) {
    const claimed = await prisma.alibabaDraft.updateMany({ where: { productId, status: record.status, updatedAt: record.updatedAt }, data: { status: "preparing", contentHash: hash, message: "正在校验发布资料。" } });
    if (!claimed.count) return { status: "syncing", message: "另一请求正在处理此商品。" };
  } else {
    try { record = await prisma.alibabaDraft.create({ data: { productId, sku: product.sku!, shopId: c.shopId!, idempotencyKey: randomUUID(), contentHash: hash, status: "preparing" } }); }
    catch (error) { if ((error as { code?: string }).code === "P2002") return { status: "syncing", message: "该商品或 SKU 已有同步请求。" }; throw error; }
  }
  let xml: string;
  try {
    const payload = draftPayload(product), schema = await fetchPublishSchema(payload.categoryId, c);
    payload.images.forEach(allowedImageUrl);
    const initial = compileAlibabaSchema(schema, payload, payload.images.map((url, i) => ({ id: String(i + 1), url })));
    if (initial.missingFields.length) {
      await prisma.alibabaDraft.update({ where: { productId }, data: { status: "failed", message: "国际站类目要求补充资料。" } });
      return { status: "blocked", message: "请读取并填写国际站类目补充项。", missingFields: initial.missingFields };
    }
    const photos: AlibabaPhoto[] = [];
    for (const src of payload.images.slice(0, 20)) {
      photos.push(await uploadPhoto(src, c));
      await prisma.alibabaDraft.update({ where: { productId }, data: { message: `已准备 ${photos.length} 张图片。` } });
    }
    const compiled = compileAlibabaSchema(schema, payload, photos);
    if (compiled.missingFields.length) throw new Error("国际站类目图片资料校验未通过。");
    xml = compiled.xml;
    const latest = await prisma.product.findUnique({ where: { id: productId } });
    const current = await readConnection();
    if (!latest || !current || !isAlibabaApproved(latest) || draftContentHash(latest) !== hash || current.shopId !== c.shopId || current.appKey !== c.appKey ||
      (trigger === "automatic" && (!latest.alibabaSyncEnabled || !current.autoEnabled))) throw new Error("商品资料或发布开关已改变，请重新检查。");
  } catch (error) {
    const message = safeMessage(error);
    await prisma.alibabaDraft.update({ where: { productId }, data: { status: "failed", message } });
    return { status: "failed", message };
  }
  // Persist the point of no safe retry BEFORE sending the create request.
  await prisma.alibabaDraft.update({ where: { productId }, data: { status: "submitting", message: "已发送发布请求，等待国际站结果。" } });
  try {
    const result = await callAlibaba("alibaba.icbu.product.schema.add", { param_product_top_publish_request: JSON.stringify({ cat_id: product.alibabaCategoryId, language: "en_US", publish_type: "default", xml }) }, c);
    if (result.biz_success === false || result.biz_success === "false") {
      const code = String(result.msg_code ?? "BUSINESS_VALIDATION_FAILED").replace(/[^a-zA-Z0-9_.;-]/g, "").slice(0, 160);
      if (/SYS|SYSTEM|TIMEOUT|INTERNAL|UNKNOWN/i.test(code)) throw new AlibabaApiError(code, "", true);
      const message = `国际站未接受商品：${code}。请补充资料后重试。`;
      await prisma.alibabaDraft.update({ where: { productId }, data: { status: "failed", message } });
      return { status: "failed", message };
    }
    const id = String(result.product_id ?? "");
    if (!(result.biz_success === true || result.biz_success === "true") || !/^[1-9]\d{0,19}$/.test(id)) throw new Error("Missing publication receipt");
    await prisma.alibabaDraft.update({ where: { productId }, data: { status: "submitted", draftId: id, message: "已提交国际站审核，请等待平台审核结果。" } });
    return { status: "submitted", productId: id, message: "已提交国际站审核。", existing: false };
  } catch (error) {
    // An explicit gateway rejection has no side effect. Unknown/5xx/crash stays uncertain.
    const rejected = error instanceof AlibabaApiError && !error.uncertain;
    const message = rejected ? safeMessage(error) : "发布结果待核对。请到 My Alibaba 检查，系统不会自动重复提交。";
    await prisma.alibabaDraft.update({ where: { productId }, data: { status: rejected ? "failed" : "uncertain", message } });
    return { status: rejected ? "failed" : "uncertain", message };
  }
}
export async function autoPublishAlibabaProduct(productId: number): Promise<PublishResult> {
  try { return await publishAlibabaProduct(productId, "automatic"); }
  catch { return { status: "failed", message: "官网产品已保存，国际站同步未完成，请检查连接状态。" }; }
}
export async function alibabaPublicationStatus(productId: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;
  const c = connectionStatus(await readConnection()), record = await prisma.alibabaDraft.findUnique({ where: { productId } });
  return { approved: isAlibabaApproved(product), autoEnabled: c.autoEnabled, optedIn: product.alibabaSyncEnabled, connectionConfigured: c.connected,
    missingFields: [...missingProductFields(product), ...(!c.connected ? [{ field: "connection", message: "请授权并验证国际站连接。" }] : [])],
    record: record ? { status: record.status, productId: record.status === "submitted" ? record.draftId : null, message: record.message, changedSinceSync: record.contentHash !== draftContentHash(product) } : null };
}
