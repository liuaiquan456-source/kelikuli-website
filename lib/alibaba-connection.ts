import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rename, open, unlink } from "node:fs/promises";
import path from "node:path";
import { callAlibaba, type AlibabaCredentials } from "./alibaba-client";

export interface AlibabaConnection extends AlibabaCredentials {
  revision: string; refreshToken?: string; expiresAt?: number; refreshExpiresAt?: number;
  shopId?: string; account?: string; verifiedAt?: number; autoEnabled: boolean;
  oauth?: { stateHash: string; sessionHash: string; expiresAt: number };
}
const directory = () => process.env.ALIBABA_PRIVATE_DIR || path.join(process.cwd(), "private", "alibaba");
const vaultPath = () => path.join(directory(), "connection.enc");
function key() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (Buffer.byteLength(secret) < 32) throw new Error("管理员会话密钥未配置，不能保存国际站授权。");
  return createHash("sha256").update("kelikuli-alibaba-v1\0" + secret).digest();
}
export function encryptConnection(value: AlibabaConnection) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") });
}
export function decryptConnection(raw: string): AlibabaConnection {
  const value = JSON.parse(raw);
  if (value.v !== 1) throw new Error("授权存储版本不支持。");
  const cipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(value.iv, "base64"));
  cipher.setAuthTag(Buffer.from(value.tag, "base64"));
  return JSON.parse(Buffer.concat([cipher.update(Buffer.from(value.data, "base64")), cipher.final()]).toString("utf8"));
}
export async function readConnection(): Promise<AlibabaConnection | null> {
  try { return decryptConnection(await readFile(vaultPath(), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw new Error("国际站授权存储无法读取，请在连接页面重新配置。"); }
}
async function writeConnection(value: AlibabaConnection) {
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  const tmp = vaultPath() + "." + randomUUID();
  await writeFile(tmp, encryptConnection(value), { mode: 0o600, flag: "wx" });
  await rename(tmp, vaultPath());
}
// Cross-process lock protects rotating refresh tokens. Never steal a stale lock:
// after a crash, an administrator must verify whether refresh was consumed.
export async function mutateConnection<T>(fn: (current: AlibabaConnection | null) => Promise<{ connection: AlibabaConnection; result: T }>): Promise<T> {
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  let lock;
  try { lock = await open(path.join(directory(), "connection.lock"), "wx", 0o600); }
  catch { throw new Error("授权更新正在进行或上次更新中断，请稍后重试；持续出现时需检查服务器授权锁。"); }
  try {
    const { connection, result } = await fn(await readConnection());
    await writeConnection({ ...connection, revision: randomUUID() });
    return result;
  } finally { await lock.close(); await unlink(path.join(directory(), "connection.lock")); }
}
export function connectionStatus(c: AlibabaConnection | null) {
  return { configured: !!c, connected: !!c?.accessToken && !!c.verifiedAt && ((c.expiresAt ?? 0) > Date.now() || (c.refreshExpiresAt ?? 0) > Date.now()),
    appKey: c?.appKey ?? "", account: c?.account ?? "", shopId: c?.shopId ?? "", autoEnabled: c?.autoEnabled ?? false,
    expiresAt: c?.expiresAt ?? null, verifiedAt: c?.verifiedAt ?? null,
    callbackUrl: "https://kelikuli.com/api/integrations/alibaba/callback" };
}
export async function configureConnection(appKey: string, appSecret: string) {
  if (!/^[0-9]{4,20}$/.test(appKey) || appSecret.length < 16 || appSecret.length > 256 || /\s/.test(appSecret)) throw new Error("请填写有效的 App Key 和 App Secret。");
  return mutateConnection(async () => ({ connection: { appKey, appSecret, revision: randomUUID(), autoEnabled: false }, result: { ok: true } }));
}
export const hashSecret = (value: string) => createHash("sha256").update(value).digest("hex");
export async function beginAuthorization(session: string) {
  const state = randomBytes(32).toString("base64url");
  return mutateConnection(async c => {
    if (!c) throw new Error("请先保存应用配置。");
    const url = new URL("https://open-api.alibaba.com/oauth/authorize");
    url.search = new URLSearchParams({ response_type: "code", force_auth: "true", client_id: c.appKey,
      redirect_uri: connectionStatus(c).callbackUrl, state }).toString();
    return { connection: { ...c, oauth: { stateHash: hashSecret(state), sessionHash: hashSecret(session), expiresAt: Date.now() + 15 * 60_000 } }, result: url.href };
  });
}
function tokenConnection(c: AlibabaConnection, result: Record<string, unknown>): AlibabaConnection {
  if (typeof result.access_token !== "string" || !result.access_token || !Number.isFinite(Number(result.expires_in)) || Number(result.expires_in) <= 0) throw new Error("国际站没有返回有效授权令牌。");
  const account = String(result.account ?? c.account ?? "");
  const shopId = String(result.havana_id ?? result.user_id ?? account);
  if (!shopId || (c.shopId && c.shopId !== shopId)) throw new Error("授权店铺与已连接店铺不同，请先核对账号。");
  return { ...c, oauth: undefined, accessToken: result.access_token, refreshToken: typeof result.refresh_token === "string" ? result.refresh_token : c.refreshToken,
    account, shopId, expiresAt: Date.now() + Number(result.expires_in) * 1000,
    refreshExpiresAt: result.refresh_expires_in !== undefined ? Date.now() + Number(result.refresh_expires_in) * 1000 : c.refreshExpiresAt };
}
export async function finishAuthorization(code: string, state: string, session: string) {
  return mutateConnection(async c => {
    if (!c?.oauth || c.oauth.expiresAt < Date.now() || c.oauth.stateHash !== hashSecret(state) || c.oauth.sessionHash !== hashSecret(session)) throw new Error("授权校验已过期，请从后台重新发起连接。");
    // Persist consumption before exchanging a one-use code.
    await writeConnection({ ...c, oauth: undefined });
    const next = tokenConnection(c, await callAlibaba("/auth/token/create", { code }, c));
    return { connection: { ...next, verifiedAt: undefined, autoEnabled: false }, result: true };
  });
}
let refreshing: Promise<AlibabaConnection> | undefined;
export async function authorizedConnection(): Promise<AlibabaConnection> {
  const c = await readConnection();
  if (!c?.accessToken) throw new Error("请先在国际站连接页面完成店铺授权。");
  if ((c.expiresAt ?? 0) > Date.now() + 30 * 60_000) return c;
  if (!refreshing) refreshing = mutateConnection(async latest => {
    if (!latest?.accessToken) throw new Error("授权已改变，请重新连接。");
    if ((latest.expiresAt ?? 0) > Date.now() + 30 * 60_000) return { connection: latest, result: latest };
    if (!latest.refreshToken || (latest.refreshExpiresAt ?? 0) <= Date.now()) throw new Error("店铺授权已过期，请重新授权。");
    const next = tokenConnection(latest, await callAlibaba("/auth/token/refresh", { refresh_token: latest.refreshToken }, latest));
    return { connection: next, result: next };
  }).finally(() => { refreshing = undefined; });
  return refreshing;
}
export async function verifyConnection() {
  const c = await authorizedConnection();
  await callAlibaba("alibaba.icbu.product.list", { current_page: "1", page_size: "1", language: "ENGLISH" }, c);
  const schema = await callAlibaba("alibaba.icbu.product.schema.get", { param_product_top_publish_request: JSON.stringify({ cat_id: "1720", language: "en_US", publish_type: "default" }) }, c);
  if (!(schema.biz_success === true || schema.biz_success === "true") || typeof schema.data !== "string" || !schema.data.includes("<itemSchema")) throw new Error("商品查询成功，但发布类目权限未验证通过。");
  return mutateConnection(async current => {
    if (!current || current.appKey !== c.appKey || current.shopId !== c.shopId || current.accessToken !== c.accessToken) throw new Error("连接已改变，请重新验证。");
    const next = { ...current, verifiedAt: Date.now() };
    return { connection: next, result: connectionStatus(next) };
  });
}
