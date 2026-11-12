import { DRAFT_METHOD, type MissingField, type draftPayload } from "./alibaba-draft-data";

// This is KELIKULI's gateway contract, NOT Alibaba's wire protocol. An authorized
// connector must implement schema retrieval, photo-bank import and draft creation.
// Keep this disabled until that connector and the shop's permissions are verified.
export function gatewayConfig() {
  const raw = process.env.ALIBABA_DRAFT_GATEWAY_URL ?? "";
  let url = "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password && !parsed.search && !parsed.hash) url = raw.replace(/\/$/, "");
  } catch { /* unconfigured */ }
  return {
    url, token: process.env.ALIBABA_DRAFT_GATEWAY_TOKEN ?? "",
    shopId: process.env.ALIBABA_SHOP_ID ?? "",
    enabled: process.env.ALIBABA_DRAFT_ENABLED === "true",
    autoEnabled: process.env.ALIBABA_AUTO_SYNC_ENABLED === "true",
  };
}

export function missingConnectionFields(): MissingField[] {
  const config = gatewayConfig();
  const missing: MissingField[] = [];
  if (!config.url || config.token.length < 32) missing.push({ field: "connection", message: "尚未配置并验证国际站授权连接服务。" });
  if (!config.shopId) missing.push({ field: "shop", message: "尚未配置已授权的国际站店铺标识。" });
  if (!config.enabled) missing.push({ field: "permission", message: "尚未确认商品草稿权限并启用同步。" });
  return missing;
}

export class GatewayError extends Error {}

export async function gatewayRequest(path: "/validate" | "/drafts" | "/drafts/lookup", body: Record<string, unknown>) {
  const config = gatewayConfig();
  if (missingConnectionFields().length) throw new GatewayError("国际站连接未就绪。");
  try {
    const response = await fetch(`${config.url}${path}`, {
      method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(25_000),
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, shopId: config.shopId, method: DRAFT_METHOD, draftOnly: true }),
    });
    if (!response.ok) throw new GatewayError("连接服务请求失败，请检查授权、接口权限及服务状态。");
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new GatewayError("连接服务响应格式不正确。");
    const record = result as Record<string, unknown>;
    if (record.shopId !== config.shopId || record.method !== DRAFT_METHOD) throw new GatewayError("连接服务返回的店铺或草稿接口不匹配。");
    return record;
  } catch (error) {
    // Never expose upstream response bodies, URLs or tokens to callers/logs.
    if (error instanceof GatewayError) throw error;
    throw new GatewayError("连接服务未返回可确认的结果。");
  }
}

export async function validateAtGateway(product: ReturnType<typeof draftPayload>) {
  const payload = { ...product, images: product.images.map(src => src.startsWith("/") ? `https://kelikuli.com${src}` : src) };
  const result = await gatewayRequest("/validate", { product: payload });
  if (!Array.isArray(result.missingFields) || result.missingFields.length > 100) throw new GatewayError("连接服务未返回类目校验结果。");
  const missingFields: MissingField[] = result.missingFields.map((value: unknown) => {
    if (!value || typeof value !== "object") throw new GatewayError("类目缺项格式不正确。");
    const { field, message } = value as MissingField;
    if (typeof field !== "string" || typeof message !== "string" || field.length > 200 || message.length > 500) throw new GatewayError("类目缺项格式不正确。");
    return { field, message };
  });
  if (missingFields.length) return { missingFields, validationToken: "" };
  if (result.valid !== true || typeof result.validationToken !== "string" || !result.validationToken || result.validationToken.length > 2000) {
    throw new GatewayError("连接服务尚未确认类目规则与图片校验通过。");
  }
  return { missingFields, validationToken: result.validationToken };
}

export function verifiedDraftId(result: Record<string, unknown>, sku: string, idempotencyKey: string): string {
  if (result.status !== "draft" || result.sku !== sku || result.idempotencyKey !== idempotencyKey ||
    typeof result.draftId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(result.draftId)) {
    throw new GatewayError("无法确认草稿编号，请在 My Alibaba 核对结果。");
  }
  return result.draftId;
}
