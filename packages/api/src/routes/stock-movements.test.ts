import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => {
  const chain = () => {
    const c = {} as Record<string, ReturnType<typeof vi.fn>>;
    let _resolve: (v: unknown) => void;
    const _promise = new Promise((r) => {
      _resolve = r;
    });
    c.then = (onFulfilled: (v: unknown) => unknown) => _promise.then(onFulfilled);

    c.orderBy = vi.fn(() => chain());
    c.returning = vi.fn(() => chain());
    c.where = vi.fn(() => chain());
    c.from = vi.fn(() => chain());
    c.set = vi.fn(() => chain());
    c.values = vi.fn(() => chain());
    c.limit = vi.fn(() => chain());
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
    soapVariants: Object.fromEntries(
      ['id', 'name', 'slug', 'unitPrice', 'enabled', 'archived', 'createdAt', 'updatedAt'].map(
        (k) => [k, col(k)],
      ),
    ),
    stockMovements: Object.fromEntries(
      ['id', 'variantId', 'type', 'quantity', 'reason', 'referenceId', 'createdAt'].map((k) => [
        k,
        col(k),
      ]),
    ),
    variantAttributes: {
      id: col('id'),
      variantId: col('variantId'),
      attributeId: col('attributeId'),
      value: col('value'),
    },
    catalogAttributes: Object.fromEntries(
      ['id', 'type', 'name', 'slug', 'displayOrder', 'archived', 'createdAt', 'updatedAt'].map(
        (k) => [k, col(k)],
      ),
    ),
    users: { id: col('id'), email: col('email'), name: col('name'), role: col('role') },
    sessions: { id: col('id'), userId: col('userId'), token: col('token') },
    accounts: { id: col('id'), userId: col('userId') },
    verifications: { id: col('id'), token: col('token') },
  };
});

vi.mock('@lotr/shared', () => ({
  stockAdjustmentSchema: {
    safeParse(data: unknown) {
      if (typeof data !== 'object' || data === null)
        return {
          success: false as const,
          error: { flatten: () => ({ fieldErrors: {}, formErrors: ['Invalid input'] }) },
        };
      const d = data as Record<string, unknown>;
      const errors: Record<string, string[]> = {};
      if (typeof d.variantId !== 'string' || !d.variantId)
        errors.variantId = ['Variant ID is required'];
      if (typeof d.quantity !== 'number') errors.quantity = ['Quantity must be a number'];
      if (typeof d.reason !== 'string' || !d.reason) errors.reason = ['Reason is required'];
      if (Object.keys(errors).length > 0)
        return {
          success: false as const,
          error: { flatten: () => ({ fieldErrors: errors, formErrors: [] }) },
        };
      return { success: true as const, data: d };
    },
  },
  movementTypeSchema: {
    safeParse(value: unknown) {
      const valid = ['adjustment', 'allocation', 'cancellation_restock', 'production'];
      if (typeof value === 'string' && valid.includes(value)) {
        return { success: true as const, data: value };
      }
      return { success: false as const };
    },
  },
}));

vi.mock('../middleware/require-auth', () => ({
  requireAuth: async (_c: unknown, next: () => Promise<void>) => {
    await next();
  },
}));

vi.mock('../middleware/admin-auth', () => ({
  adminAuth: async (_c: unknown, next: () => Promise<void>) => {
    await next();
  },
}));

import { app } from '../index';

function setupSelectChain(result: unknown) {
  mocks.db.select.mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => {
        const innerChain = {
          orderBy: vi.fn(() => Promise.resolve(result)),
          groupBy: vi.fn(() => Promise.resolve(result)),
          then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled),
        };
        return innerChain;
      }),
      orderBy: vi.fn(() => Promise.resolve(result)),
    })),
  });
}

function setupInsertChain(result: unknown) {
  mocks.db.insert.mockReturnValueOnce({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve(result)),
    })),
  });
}

describe('GET /api/admin/stock-movements', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns list of stock movements', async () => {
    setupSelectChain([
      {
        id: 'm1',
        variantId: 'v1',
        type: 'adjustment',
        quantity: 10,
        reason: 'Initial stock',
        referenceId: null,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]);

    const res = await app.request('/api/admin/stock-movements');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.movements).toHaveLength(1);
    expect(body.movements[0].type).toBe('adjustment');
  });

  it('filters by variantId', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/stock-movements?variantId=v1');
    expect(res.status).toBe(200);
  });

  it('filters by type', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/stock-movements?type=adjustment');
    expect(res.status).toBe(200);
  });

  it('filters by date range', async () => {
    setupSelectChain([]);

    const res = await app.request(
      '/api/admin/stock-movements?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z',
    );
    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/stock-movements/stock-level/:variantId', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns current stock level for a variant', async () => {
    // Variant exists check
    setupSelectChain([{ id: 'v1' }]);
    // Stock sum
    setupSelectChain([{ total: 25 }]);

    const res = await app.request('/api/admin/stock-movements/stock-level/v1');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.stock).toBe(25);
    expect(body.variantId).toBe('v1');
  });

  it('returns 404 for nonexistent variant', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/stock-movements/stock-level/nonexistent');
    expect(res.status).toBe(404);
  });

  it('returns 0 stock when no movements exist', async () => {
    setupSelectChain([{ id: 'v1' }]);
    setupSelectChain([{ total: 0 }]);

    const res = await app.request('/api/admin/stock-movements/stock-level/v1');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.stock).toBe(0);
  });
});

describe('GET /api/admin/stock-movements/stock-levels', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns stock levels for all non-archived variants', async () => {
    // Variants list
    setupSelectChain([
      { id: 'v1', name: 'Lavender Soap' },
      { id: 'v2', name: 'Rose Soap' },
    ]);
    // Stock totals
    setupSelectChain([
      { variantId: 'v1', total: 10 },
      { variantId: 'v2', total: 5 },
    ]);

    const res = await app.request('/api/admin/stock-movements/stock-levels');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.stockLevels).toHaveLength(2);
    expect(body.stockLevels[0].stock).toBe(10);
    expect(body.stockLevels[1].stock).toBe(5);
  });

  it('returns empty array when no variants exist', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/stock-movements/stock-levels');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.stockLevels).toHaveLength(0);
  });
});

describe('POST /api/admin/stock-movements', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a positive stock adjustment', async () => {
    // Variant exists check
    setupSelectChain([{ id: 'v1' }]);
    // Insert
    setupInsertChain([
      {
        id: 'm1',
        variantId: 'v1',
        type: 'adjustment',
        quantity: 10,
        reason: 'New batch',
        referenceId: null,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]);

    const res = await app.request('/api/admin/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: 'v1', quantity: 10, reason: 'New batch' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.movement.quantity).toBe(10);
    expect(body.movement.type).toBe('adjustment');
  });

  it('creates a negative stock adjustment when sufficient stock', async () => {
    // Variant exists check
    setupSelectChain([{ id: 'v1' }]);
    // Current stock check
    setupSelectChain([{ total: 20 }]);
    // Insert
    setupInsertChain([
      {
        id: 'm2',
        variantId: 'v1',
        type: 'adjustment',
        quantity: -5,
        reason: 'Correction',
        referenceId: null,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]);

    const res = await app.request('/api/admin/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: 'v1', quantity: -5, reason: 'Correction' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.movement.quantity).toBe(-5);
  });

  it('rejects negative adjustment that would go below zero', async () => {
    // Variant exists check
    setupSelectChain([{ id: 'v1' }]);
    // Current stock check
    setupSelectChain([{ total: 3 }]);

    const res = await app.request('/api/admin/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: 'v1', quantity: -5, reason: 'Too much' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Insufficient stock');
    expect(body.currentStock).toBe(3);
    expect(body.requestedChange).toBe(-5);
  });

  it('rejects invalid input', async () => {
    const res = await app.request('/api/admin/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: '', quantity: 'bad', reason: '' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('returns 404 for nonexistent variant', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: 'nonexistent', quantity: 10, reason: 'Test' }),
    });

    expect(res.status).toBe(404);
  });
});
