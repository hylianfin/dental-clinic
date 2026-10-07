import "server-only";

/**
 * Dependency-free fixed-window rate limiter.
 *
 * Scope: a single Node process. It stops casual form spam and scripted
 * double-submits, which is enough for the public booking/contact endpoints on a
 * single-instance deployment. On serverless/multi-instance hosting, swap the
 * `store` for Redis (Upstash) or Supabase — the call sites do not change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/** Guards against unbounded growth if a bot floods unique keys. */
const MAX_KEYS = 5_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (store.size > MAX_KEYS) {
    for (const [existingKey, bucket] of store) {
      if (bucket.resetAt <= now) store.delete(existingKey);
    }
    if (store.size > MAX_KEYS) store.clear();
  }

  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/** Best-effort client identity for rate limiting (behind a proxy too). */
export function clientKeyFrom(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}
