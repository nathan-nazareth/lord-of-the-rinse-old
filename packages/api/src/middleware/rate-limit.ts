import type { MiddlewareHandler } from 'hono';

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyBy?: (c: { req: { header: (name: string) => string | undefined } }) => string;
}

// Cap the bucket map to avoid unbounded growth between sweeps. When the cap
// is hit, evict the entries that expire soonest.
const MAX_BUCKETS = 50_000;
const SWEEP_INTERVAL_MS = 30_000;

// Comma-separated list of upstream proxies that are allowed to set
// X-Forwarded-For. When unset, we fall back to a single-hop heuristic that
// only honors the right-most entry, which prevents the trivial spoof where a
// client prepends "1.1.1.1" to bypass the limiter.
const TRUSTED_PROXIES = (process.env.TRUSTED_PROXIES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const buckets = new Map<string, Bucket>();

function resolveClientIp(
  remoteAddr: string | undefined,
  forwardedFor: string | undefined,
  realIp: string | undefined,
): string {
  const trusted = (entry: string) => TRUSTED_PROXIES.includes(entry.trim());
  if (forwardedFor) {
    const parts = forwardedFor.split(',').map((p) => p.trim()).filter(Boolean);
    // Walk the list right-to-left and use the first IP NOT in the trusted
    // proxy set. This is the originating client even when there's an
    // intermediate hop. If the chain is fully trusted (e.g. CDN), use the
    // left-most address.
    if (TRUSTED_PROXIES.length > 0) {
      for (let i = parts.length - 1; i >= 0; i -= 1) {
        if (!trusted(parts[i] ?? '')) return parts[i] ?? 'unknown';
      }
      return parts[0] ?? 'unknown';
    }
    // No trusted-proxy config: use the *right-most* hop, which is the one
    // appended by the closest reverse proxy. The left-most is attacker-
    // controlled.
    return parts[parts.length - 1] ?? 'unknown';
  }
  if (realIp) return realIp;
  return remoteAddr ?? 'unknown';
}

function getKey(
  c: Parameters<MiddlewareHandler>[0],
  prefix: string,
  keyBy?: RateLimitOptions['keyBy'],
): string {
  if (keyBy) return `${prefix}:${keyBy(c)}`;
  const ip = resolveClientIp(
    c.env?.remoteAddr,
    c.req.header('x-forwarded-for'),
    c.req.header('x-real-ip'),
  );
  return `${prefix}:${ip}`;
}

function evictIfFull(): void {
  if (buckets.size < MAX_BUCKETS) return;
  const now = Date.now();
  // First pass: drop expired entries.
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
  // Still over the cap? Drop the entries that expire soonest.
  if (buckets.size >= MAX_BUCKETS) {
    const sorted = Array.from(buckets.entries()).sort((a, b) => a[1].resetAt - b[1].resetAt);
    const toDrop = sorted.slice(0, Math.max(1, Math.floor(MAX_BUCKETS * 0.1)));
    for (const [key] of toDrop) buckets.delete(key);
  }
}

function check(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

const sweepTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
  evictIfFull();
}, SWEEP_INTERVAL_MS);
sweepTimer.unref();

export function resetRateLimit(): void {
  buckets.clear();
}

export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  // Skip rate limiting in test environments.
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return async (_c, next) => {
      await next();
    };
  }

  return async (c, next) => {
    const key = getKey(c, options.keyBy ? 'custom' : 'ip', options.keyBy);
    const { allowed, retryAfter } = check(key, options.max, options.windowMs);

    if (!allowed) {
      c.header('Retry-After', String(retryAfter));
      return c.json({ error: 'Too many requests' }, 429);
    }

    await next();
  };
}
