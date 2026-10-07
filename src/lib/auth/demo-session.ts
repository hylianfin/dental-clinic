import type { StaffRole } from "@/lib/supabase/types";

/**
 * Signed cookie used ONLY for the offline demo dashboard.
 *
 * When Supabase is configured this file is never used for authentication —
 * Supabase Auth sessions take over. It exists so the admin dashboard can be
 * demonstrated (and reviewed) before a Supabase project exists.
 *
 * Implementation notes:
 *  - Uses Web Crypto (`crypto.subtle`), which is available in both the Node and
 *    Edge runtimes, so the same helpers work in middleware and Server Components.
 *  - HMAC-SHA256 over a base64url payload; constant-time comparison.
 */

export const DEMO_SESSION_COOKIE = "db_demo_session";
export const DEMO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export interface DemoSessionPayload {
  email: string;
  name: string;
  role: StaffRole;
  /** Expiry, seconds since epoch. */
  exp: number;
}

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncode(encoder.encode(value));
}

function base64UrlDecodeToString(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function secret(): string {
  // A stable fallback keeps local development working; production deployments
  // must set SESSION_SECRET (documented in .env.example and the README).
  return process.env.SESSION_SECRET?.trim() || "dev-only-insecure-session-secret";
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signDemoSession(payload: DemoSessionPayload): Promise<string> {
  const body = base64UrlEncodeString(JSON.stringify(payload));
  const key = await hmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyDemoSession(token: string | undefined): Promise<DemoSessionPayload | null> {
  if (!token || !token.includes(".")) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const key = await hmacKey();
    const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedEncoded = base64UrlEncode(new Uint8Array(expected));

    // Constant-time-ish comparison.
    if (expectedEncoded.length !== signature.length) return null;
    let mismatch = 0;
    for (let index = 0; index < expectedEncoded.length; index += 1) {
      mismatch |= expectedEncoded.charCodeAt(index) ^ signature.charCodeAt(index);
    }
    if (mismatch !== 0) return null;

    const payload = JSON.parse(base64UrlDecodeToString(body)) as DemoSessionPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
