import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => {
  const chain = () => {
    const c = {} as Record<string, unknown>;
    c.orderBy = vi.fn(() => chain());
    c.returning = vi.fn(() => chain());
    c.where = vi.fn(() => chain());
    c.from = vi.fn(() => chain());
    c.set = vi.fn(() => chain());
    c.values = vi.fn(() => chain());
    c.limit = vi.fn(() => chain());
    c.onConflictDoUpdate = vi.fn(() => chain());
    c.then = (onFulfilled: (v: unknown) => unknown) => Promise.resolve([]).then(onFulfilled);
    return c;
  };
  const db = {
    select: vi.fn(() => chain()),
    insert: vi.fn(() => chain()),
    update: vi.fn(() => chain()),
    delete: vi.fn(() => chain()),
    transaction: vi.fn(async (cb: (tx: typeof db) => Promise<unknown>) => cb(db)),
  };
  return { mocks: { db, chain } };
});

vi.mock('@lotr/db', () => ({
  db: mocks.db,
  sql: (strings: TemplateStringsArray) => strings.join(''),
}));

vi.mock('@lotr/db/schema', () => {
  const col = (name: string) => name;
  return {
    catalogAttributes: { id: col('id'), type: col('type'), name: col('name'), slug: col('slug') },
    soapVariants: { id: col('id'), name: col('name'), unitPrice: col('unitPrice') },
    variantAttributes: { id: col('id'), variantId: col('variantId') },
    commerceSettings: { key: col('key'), value: col('value') },
    orders: { id: col('id'), reference: col('reference'), status: col('status') },
    orderLines: { id: col('id'), orderId: col('orderId') },
    stockMovements: { id: col('id'), variantId: col('variantId') },
    notificationAttempts: { id: col('id'), orderId: col('orderId') },
    users: { id: col('id') },
    sessions: { id: col('id') },
    accounts: { id: col('id') },
    verifications: { id: col('id') },
  };
});

const fetchMock = vi.fn();

beforeEach(() => {
  // Provide a deterministic access key so the route doesn't 503.
  process.env.WEB3FORMS_ACCESS_KEY = 'test-access-key';
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  for (const fn of [
    mocks.db.select,
    mocks.db.insert,
    mocks.db.update,
    mocks.db.delete,
  ]) {
    fn.mockReset();
  }
  mocks.db.select.mockImplementation(() => mocks.chain());
});

// Dynamic import so the env stub above is in place before the route
// captures the secret.
const { app } = await import('../index');

describe('POST /api/webhook-submit — error sanitization', () => {
  it('replaces network errors with a sanitized message (regression for C3/S1: err.message leak)', async () => {
    // Simulate a fetch failure that would normally include the full
    // upstream URL in `err.message`. The previous implementation
    // echoed that string straight to the client, leaking internal
    // hostnames.
    fetchMock.mockRejectedValueOnce(
      new TypeError(
        'fetch failed: https://internal-staging.svc.cluster.local:8443/api/web3forms',
      ),
    );

    const res = await app.request('/api/webhook-submit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: 'Test', Email: 'test@example.com' }),
    });

    expect(res.status).toBe(502);
    const body = (await res.json()) as { success: boolean; error: string };
    expect(body.success).toBe(false);
    expect(body.error).toBe('Webhook endpoint is unreachable');
    // The internal URL must NOT appear in the response body.
    expect(JSON.stringify(body)).not.toContain('internal-staging.svc.cluster.local');
    expect(JSON.stringify(body)).not.toContain('https://');
  });

  it('returns a sanitized timeout message on AbortError', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    fetchMock.mockRejectedValueOnce(abortError);

    const res = await app.request('/api/webhook-submit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: 'Test' }),
    });

    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Webhook request timed out');
  });

  it('returns a generic message for unknown error shapes', async () => {
    fetchMock.mockRejectedValueOnce(new Error('something exotic happened'));

    const res = await app.request('/api/webhook-submit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: 'Test' }),
    });

    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string };
    // Generic line; the underlying message is not echoed.
    expect(body.error).toBe('Webhook proxy failed');
    expect(body.error).not.toContain('exotic');
  });
});
