/**
 * Simple in-memory rate limiter. Suitable for single-process deployments.
 * Each `key` (e.g. IP + endpoint) gets a sliding window of allowed calls.
 */

interface Entry {
  count: number;
  windowStart: number;
}

const store = new Map<string, Entry>();

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * @param key       Unique key, e.g. `"login:192.168.1.1"`
 * @param limit     Max allowed calls within the window
 * @param windowMs  Length of the rolling window in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/** Extract a best-effort client IP from a Next.js Request. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
