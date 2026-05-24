import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mocks } = vi.hoisted(() => {
  const chain = () => {
    const c = {} as Record<string, ReturnType<typeof vi.fn>>;
    let _resolve: (v: unknown) => void;
    const _promise = new Promise((r) => { _resolve = r; });
    c.then = (onFulfilled: (v: unknown) => unknown) => _promise.then(onFulfilled);

    c.orderBy = vi.fn(() => chain());
    c.returning = vi.fn(() => chain());
    c.where = vi.fn(() => chain());
    c.from = vi.fn(() => chain());
    c.set = vi.fn(() => chain());
    c.values = vi.fn(() => chain());
    c.limit = vi.fn(() => chain());
    c.onConflictDoUpdate = vi.fn(() => chain());
    c.groupBy = vi.fn(() => chain());

    c._resolve = (v: unknown) => _resolve!(v);
    return c;
  };

  const db = {
    select: vi.fn(() => chain()),
    insert: vi.fn(() => chain()),
    update: vi.fn(() => chain()),
    delete: vi.fn(() => chain()),
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
    catalogAttributes: { id: col('id'), type: col('type'), name: col('name'), slug: col('slug'), displayOrder: col('displayOrder'), archived: col('archived'), createdAt: col('createdAt'), updatedAt: col('updatedAt') },
    soapVariants: { id: col('id'), name: col('name'), slug: col('slug'), unitPrice: col('unitPrice'), enabled: col('enabled'), archived: col('archived'), createdAt: col('createdAt'), updatedAt: col('updatedAt') },
    variantAttributes: { id: col('id'), variantId: col('variantId'), attributeId: col('attributeId'), value: col('value') },
    commerceSettings: { key: col('key'), value: col('value') },
    orders: { id: col('id'), reference: col('reference'), status: col('status'), customerName: col('customerName'), customerEmail: col('customerEmail'), total: col('total'), createdAt: col('createdAt'), updatedAt: col('updatedAt') },
    orderLines: { id: col('id'), orderId: col('orderId'), variantId: col('variantId'), displayName: col('displayName'), quantity: col('quantity'), unitPrice: col('unitPrice'), allocatedFromStock: col('allocatedFromStock'), quantityToProduce: col('quantityToProduce'), createdAt: col('createdAt') },
    stockMovements: { id: col('id'), variantId: col('variantId'), type: col('type'), quantity: col('quantity'), reason: col('reason'), referenceId: col('referenceId'), createdAt: col('createdAt') },
    notificationAttempts: { id: col('id'), orderId: col('orderId'), provider: col('provider'), status: col('status'), attempts: col('attempts'), lastError: col('lastError'), createdAt: col('createdAt'), updatedAt: col('updatedAt') },
    users: { id: col('id'), email: col('email'), name: col('name'), role: col('role') },
    sessions: { id: col('id'), userId: col('userId'), token: col('token') },
    accounts: { id: col('id'), userId: col('userId') },
    verifications: { id: col('id'), token: col('token') },
  };
});

vi.mock('./middleware/require-auth', () => ({
  requireAuth: async (_c: unknown, next: () => Promise<void>) => {
    await next();
  },
}));

import { app } from './index';

describe('Global error handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 with error message for malformed JSON body', async () => {
    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json}',
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 for truncated JSON body', async () => {
    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"items":',
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 500 with generic message for unhandled errors (no stack trace leak)', async () => {
    // Force a database error by making db.select throw
    mocks.db.select.mockImplementationOnce(() => {
      throw new Error('SQLITE_ERROR: no such table: orders -- leaked internal detail');
    });

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, displayName: 'Test', unitPrice: '10.00' }],
        customerName: 'Test User',
        customerEmail: 'test@example.com',
      }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'Internal server error' });
    // Ensure internal details are NOT exposed
    expect(JSON.stringify(body)).not.toContain('SQLITE_ERROR');
    expect(JSON.stringify(body)).not.toContain('no such table');
  });

  it('logs the full error server-side', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mocks.db.select.mockImplementationOnce(() => {
      throw new Error('SQLITE_ERROR: connection lost');
    });

    await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, displayName: 'Test', unitPrice: '10.00' }],
        customerName: 'Test User',
        customerEmail: 'test@example.com',
      }),
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unhandled error:',
      expect.objectContaining({ message: 'SQLITE_ERROR: connection lost' }),
    );

    consoleErrorSpy.mockRestore();
  });

  it('logs syntax errors to console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unhandled error:',
      expect.any(SyntaxError),
    );

    consoleErrorSpy.mockRestore();
  });
});
