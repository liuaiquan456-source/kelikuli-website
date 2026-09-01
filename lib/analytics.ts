// Helpers for the visitor-tracking / traffic-source analytics feature.

export type Geo = { country: string; countryCode: string; region: string; city: string };

const EMPTY_GEO: Geo = { country: "", countryCode: "", region: "", city: "" };

const BOT_RE =
  /bot|crawler|spider|crawling|slurp|mediapartners|bingpreview|facebookexternalhit|whatsapp|telegrambot|headless|phantomjs|lighthouse|pingdom|uptimerobot|semrush|ahrefs|dotbot|petalbot|python-requests|curl\/|wget/i;

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_RE.test(userAgent);
}

/** Pull the real client IP out of the proxy headers (Cloudflare / nginx / Vercel). */
export function clientIpFrom(headers: Headers): string {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    (headers.get("x-forwarded-for") || "").split(",")[0],
    (headers.get("x-vercel-forwarded-for") || "").split(",")[0],
    headers.get("fastly-client-ip"),
    headers.get("true-client-ip"),
  ];
  for (const c of candidates) {
    const ip = normalizeIp(c);
    if (ip) return ip;
  }
  return "";
}

function normalizeIp(raw: string | null | undefined): string {
  if (!raw) return "";
  let ip = raw.trim();
  if (!ip) return "";
  // strip an IPv4 port suffix like 1.2.3.4:5678
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) ip = ip.split(":")[0];
  // strip IPv6 brackets
  ip = ip.replace(/^\[|\]$/g, "");
  if (ip === "::1" || ip === "127.0.0.1") return "";
  return ip;
}

export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  return (
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    /^127\./.test(ip) ||
    ip === "::1" ||
    /^f[cd][0-9a-f]{2}:/i.test(ip)
  );
}

export function detectDevice(userAgent: string): "Desktop" | "Mobile" | "Tablet" {
  const ua = userAgent || "";
  if (/\b(iPad|Tablet|PlayBook|Silk)\b/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return "Tablet";
  }
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|Opera Mini/i.test(ua)) {
    return "Mobile";
  }
  return "Desktop";
}

const SOURCE_RULES: { test: RegExp; label: string }[] = [
  { test: /(^|\.)google\./i, label: "Google Search" },
  { test: /(^|\.)bing\.com/i, label: "Bing Search" },
  { test: /(^|\.)(yahoo|search\.yahoo)\./i, label: "Yahoo Search" },
  { test: /(^|\.)(duckduckgo)\./i, label: "DuckDuckGo" },
  { test: /(^|\.)(yandex)\./i, label: "Yandex Search" },
  { test: /(^|\.)(baidu)\./i, label: "Baidu Search" },
  { test: /(^|\.)(facebook|fb)\.com|l\.facebook/i, label: "Facebook" },
  { test: /(^|\.)instagram\.com/i, label: "Instagram" },
  { test: /(^|\.)(t\.co|twitter\.com|x\.com)/i, label: "Twitter / X" },
  { test: /(^|\.)linkedin\.com|lnkd\.in/i, label: "LinkedIn" },
  { test: /(^|\.)(youtube\.com|youtu\.be)/i, label: "YouTube" },
  { test: /(^|\.)(pinterest)\./i, label: "Pinterest" },
  { test: /(^|\.)(reddit)\.com/i, label: "Reddit" },
  { test: /(^|\.)(tiktok)\.com/i, label: "TikTok" },
  { test: /(^|\.)(alibaba|1688|aliexpress)\.com/i, label: "Alibaba" },
];

/** Classify a visit's traffic source from its referer + our own host. */
export function detectSource(referer: string, selfHost: string): string {
  if (!referer) return "Direct";
  let host = "";
  try {
    host = new URL(referer).hostname.toLowerCase();
  } catch {
    return "Other Websites";
  }
  if (!host) return "Direct";
  const self = (selfHost || "").toLowerCase().replace(/:\d+$/, "");
  if (host === self || host === `www.${self}` || `www.${host}` === self) return "Direct";

  for (const rule of SOURCE_RULES) {
    if (rule.test.test(host)) return rule.label;
  }
  return "Other Websites";
}

/** Best-effort search keyword extraction from a referer URL. */
export function extractKeyword(referer: string): string {
  if (!referer) return "";
  try {
    const u = new URL(referer);
    for (const key of ["q", "query", "p", "text", "wd", "kw", "search"]) {
      const v = u.searchParams.get(key);
      if (v && v.trim()) return v.trim();
    }
  } catch {
    /* ignore */
  }
  return "";
}

/** IP → geo via the free ip-api.com endpoint. Returns empty geo on any failure. */
export async function lookupGeo(ip: string): Promise<Geo> {
  if (!ip || isPrivateIp(ip)) return { ...EMPTY_GEO };
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`,
      { signal: AbortSignal.timeout(2500), cache: "no-store" },
    );
    if (!res.ok) return { ...EMPTY_GEO };
    const data = (await res.json()) as {
      status?: string; country?: string; countryCode?: string; regionName?: string; city?: string;
    };
    if (data.status !== "success") return { ...EMPTY_GEO };
    return {
      country: data.country || "",
      countryCode: data.countryCode || "",
      region: data.regionName || "",
      city: data.city || "",
    };
  } catch {
    return { ...EMPTY_GEO };
  }
}

/** Ordered brand colours for the known sources (used by the admin charts). */
export const SOURCE_COLORS: Record<string, string> = {
  "Google Search": "#4285F4",
  "Bing Search": "#00809D",
  "Yahoo Search": "#6001D2",
  DuckDuckGo: "#DE5833",
  "Yandex Search": "#FF0000",
  "Baidu Search": "#2319DC",
  Direct: "#6366F1",
  Facebook: "#1877F2",
  Instagram: "#E1306C",
  "Twitter / X": "#111827",
  LinkedIn: "#0A66C2",
  YouTube: "#FF0000",
  Pinterest: "#E60023",
  Reddit: "#FF4500",
  TikTok: "#010101",
  Alibaba: "#FF6A00",
  "Email Marketing": "#F59E0B",
  "Other Websites": "#94A3B8",
};
