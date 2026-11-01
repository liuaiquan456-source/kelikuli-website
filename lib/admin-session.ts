const SESSION_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

interface AdminSession {
  userId: number;
  expiresAt: number;
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(value: string) {
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
}

async function signingKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || encoder.encode(secret).length < 32) return null;
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createAdminSession(userId: number): Promise<string | null> {
  const key = await signingKey();
  if (!key) return null;
  const payload = base64url(encoder.encode(JSON.stringify({
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${base64url(new Uint8Array(signature))}`;
}

export async function readAdminSession(token: string | undefined): Promise<AdminSession | null> {
  if (!token || token.length > 1024) return null;
  try {
    const key = await signingKey();
    const parts = token.split(".");
    if (!key || parts.length !== 2) return null;
    const valid = await crypto.subtle.verify("HMAC", key, decode(parts[1]), encoder.encode(parts[0]));
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(decode(parts[0]))) as AdminSession;
    return Number.isSafeInteger(session.userId) && session.userId > 0 &&
      Number.isSafeInteger(session.expiresAt) && session.expiresAt > Date.now() / 1000
      ? session : null;
  } catch {
    return null;
  }
}

export const adminSessionMaxAge = SESSION_SECONDS;
