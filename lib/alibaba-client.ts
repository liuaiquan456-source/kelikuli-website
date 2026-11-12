import { createHmac } from "node:crypto";

export interface AlibabaCredentials { appKey: string; appSecret: string; accessToken?: string }
export class AlibabaApiError extends Error {
  constructor(public code: string, public requestId = "", public uncertain = false) {
    super(`国际站接口错误：${code}${requestId ? `（请求编号 ${requestId}）` : ""}`);
  }
}
// Matches official IOP Java SDK 1.3.18: TOP uses no API-name prefix,
// GOP token endpoints prefix the API path. Files are excluded from signing.
export function alibabaSign(prefix: string, params: Record<string, string>, secret: string) {
  const text = prefix + Object.keys(params).filter(k => k !== "sign" && params[k].trim()).sort().map(k => k + params[k]).join("");
  return createHmac("sha256", secret).update(text, "utf8").digest("hex").toUpperCase();
}
export function alibabaRequest(method: string, params: Record<string, string>, credentials: AlibabaCredentials, now = Date.now()) {
  const tokenApi = method === "/auth/token/create" || method === "/auth/token/refresh";
  if (!tokenApi && !/^alibaba\.[a-z0-9_.]+$/.test(method)) throw new Error("不支持的国际站接口。");
  const values: Record<string, string> = { ...params, app_key: credentials.appKey, timestamp: String(now), sign_method: "sha256" };
  if (!tokenApi) Object.assign(values, { method, v: "2.0", format: "json", simplify: "true", session: credentials.accessToken ?? "" });
  values.sign = alibabaSign(tokenApi ? method : "", values, credentials.appSecret);
  return { url: tokenApi ? `https://open-api.alibaba.com/rest${method}` : "https://open-api.alibaba.com/sync", values };
}
export async function callAlibaba(method: string, params: Record<string, string>, credentials: AlibabaCredentials,
  file?: { bytes: Uint8Array; name: string; mime: string }) {
  const { url, values } = alibabaRequest(method, params, credentials);
  let body: URLSearchParams | FormData = new URLSearchParams(values);
  if (file) {
    body = new FormData();
    for (const [key, value] of Object.entries(values)) body.set(key, value);
    body.set("image_bytes", new Blob([new Uint8Array(file.bytes)], { type: file.mime }), file.name);
  }
  let response: Response;
  let result: Record<string, unknown>;
  try {
    response = await fetch(url, { method: "POST", body, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(35_000) });
    const raw = await response.text();
    if (raw.length > 5_000_000) throw new Error();
    result = JSON.parse(raw);
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error();
  } catch { throw new AlibabaApiError("NETWORK_OR_RESPONSE_ERROR", "", true); }
  const error = (result.error_response ?? result) as Record<string, unknown>;
  const requestId = String(error.request_id ?? result.request_id ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  if (!response.ok || (error.code !== undefined && String(error.code) !== "0")) {
    const code = String(error.sub_code ?? error.code ?? `HTTP_${response.status}`).replace(/[^a-zA-Z0-9_.;-]/g, "").slice(0, 160);
    throw new AlibabaApiError(code || "API_ERROR", requestId, response.status >= 500 || /SYS|SYSTEM|TIMEOUT|INTERNAL|UNKNOWN/i.test(code));
  }
  // TOP may wrap non-simplified responses, despite simplify=true.
  const wrapped = result[`${method.replaceAll(".", "_")}_response`];
  return (wrapped && typeof wrapped === "object" ? { ...(wrapped as object), request_id: requestId } : result) as Record<string, unknown>;
}
