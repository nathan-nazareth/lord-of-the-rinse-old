import { rateLimit } from '../middleware/rate-limit';
import { Hono } from 'hono';

const WEB3FORMS_ENDPOINT =
  process.env.WEB3FORMS_ENDPOINT ?? 'https://api.web3forms.com/submit';
const TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BODY = 4096;

const webhookRoutes = new Hono();

webhookRoutes.use('/*', rateLimit({ windowMs: 60_000, max: 10 }));

const ALLOWED_FIELDS = new Set([
  'Name',
  'Email',
  'Phone number',
  'Soap Shape',
  'Order Details',
  'Total items',
  'Subtotal',
  'Discount',
  'Final Total',
  'order_id',
  'subject',
  'from_name',
  'replyto',
  'message',
  'submission_timestamp',
]);

function sanitizeString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n\t\0\v\f]/g, ' ').slice(0, max);
}

function sanitizeField(key: string, value: unknown): string | number | undefined {
  const max = key === 'message' || key === 'Order Details' ? 4000 : 200;
  if (key === 'Total items') {
    const n = Number(value);
    return Number.isInteger(n) && n >= 0 ? n : undefined;
  }
  if (key === 'submission_timestamp') {
    // Reject anything that isn't a parseable ISO-8601 datetime so an
    // attacker can't smuggle a hand-crafted header into the email body.
    if (typeof value !== 'string') return undefined;
    const t = Date.parse(value);
    if (!Number.isFinite(t)) return undefined;
    return new Date(t).toISOString();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string') return sanitizeString(value, max);
  return undefined;
}

webhookRoutes.post('/submit', async (c) => {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error('[webhook-submit] WEB3FORMS_ACCESS_KEY is not configured');
    return c.json({ error: 'Order notifications are temporarily unavailable' }, 503);
  }

  let body: Record<string, unknown>;
  try {
    const raw: unknown = await c.req.json();
    if (typeof raw !== 'object' || raw === null) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    body = raw as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Whitelist and sanitize every field so the client cannot inject
  // arbitrary keys (some of which Web3Forms treats as config) and so
  // CRLF / oversize values can't reach the downstream email provider.
  const payload: Record<string, string | number> = { access_key: accessKey };
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    const clean = sanitizeField(key, value);
    if (clean !== undefined) payload[key] = clean;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let parsed: { success?: boolean; message?: string } = {};
    try {
      const text = await response.text();
      if (text.length > 0 && text.length < MAX_RESPONSE_BODY) {
        parsed = JSON.parse(text) as typeof parsed;
      }
    } catch {
      // Non-JSON; fall through to status-based result.
    }

    if (!response.ok || !parsed.success) {
      // 502 Bad Gateway is the right code regardless of which side
      // rejected the call: the client request was valid, but the
      // upstream email provider either returned a non-2xx or a
      // success=false payload.
      return c.json(
        {
          success: false,
          error: parsed.message || `Webhook returned status ${response.status}`,
        },
        502,
      );
    }

    return c.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: message }, 502);
  } finally {
    clearTimeout(timeoutId);
  }
});

export default webhookRoutes;
