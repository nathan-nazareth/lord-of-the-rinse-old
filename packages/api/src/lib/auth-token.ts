import { createHmac, timingSafeEqual } from 'node:crypto';

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

function getSecret(): string {
  if (!ADMIN_TOKEN_SECRET) {
    throw new Error('ADMIN_TOKEN_SECRET is required (generate with `openssl rand -base64 32`)');
  }
  return ADMIN_TOKEN_SECRET;
}

const MAX_AGE_MS = 1000 * 60 * 60 * 8;

export interface AdminTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4;
  return Buffer.from(padding ? padded + '='.repeat(4 - padding) : padded, 'base64');
}

export function signAdminToken(subject = 'admin'): string {
  const now = Date.now();
  const payload: AdminTokenPayload = {
    sub: subject,
    iat: now,
    exp: now + MAX_AGE_MS,
  };
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'ADMIN' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = base64UrlEncode(createHmac('sha256', getSecret()).update(data).digest());
  return `${data}.${sig}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (typeof token !== 'string' || token.length === 0 || token.split('.').length !== 3) {
    return null;
  }

  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) return null;
  const expected = createHmac('sha256', getSecret()).update(`${header}.${body}`).digest();

  let provided: Buffer;
  try {
    provided = base64UrlDecode(sig);
  } catch {
    return null;
  }

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  let payload: AdminTokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(body).toString('utf-8')) as AdminTokenPayload;
  } catch {
    return null;
  }

  // Reject anything that doesn't have the contract fields we expect. Using
  // a Zod schema would be nicer, but a hand-rolled guard keeps the
  // dependency footprint small and dodges prototype-pollution risks.
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof payload.sub !== 'string' ||
    payload.sub.length === 0 ||
    payload.sub.length > 128
  ) {
    return null;
  }
  if (typeof payload.iat !== 'number' || !Number.isFinite(payload.iat)) {
    return null;
  }
  if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
    return null;
  }

  const now = Date.now();
  // 30s clock skew tolerance in both directions.
  const SKEW_MS = 30_000;
  if (payload.iat - SKEW_MS > now) return null;
  if (payload.exp + SKEW_MS < now) return null;

  return payload;
}
