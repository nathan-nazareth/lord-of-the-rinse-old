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

vi.mock('../middleware/require-auth', () => ({
  requireAuth: async (_c: unknown, next: () => Promise<void>) => {
    await next();
  },
}));

import { app } from '../index';

function setupSelectChain(result: unknown) {
  mocks.db.select.mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => {
        const innerChain = {
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve(result)),
            then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled),
          })),
          then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled),
          groupBy: vi.fn(() => Promise.resolve(result)),
        };
        return innerChain;
      }),
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve(result)),
        then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled),
      })),
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

function setupStockLevelChain(stockLevel: number) {
  // For the stock level query: select({ total: ... }).from(stockMovements).where(...)
  mocks.db.select.mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([{ total: stockLevel }])),
    })),
  });
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 for invalid request body', async () => {
    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 for invalid email', async () => {
    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, displayName: 'Test', unitPrice: '12.99' }],
        customerName: 'John',
        customerEmail: 'not-email',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('creates an order with stock allocation', async () => {
    const orderId = 'order-uuid-1';
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    // 1. Select for reference generation (no existing orders today)
    setupSelectChain([]);

    // 2. Insert order (returning)
    setupInsertChain([{ id: orderId, reference: 'LOR-20260523-0001', status: 'new', total: '12.99' }]);

    // 3. Stock level for variant: 5 in stock
    setupStockLevelChain(5);

    // 4. Insert order line
    setupInsertChain([{ id: 'line-1' }]);

    // 5. Insert stock movement (allocation)
    setupInsertChain([{ id: 'movement-1' }]);

    // 6. Insert notification attempt
    setupInsertChain([{ id: 'notif-1' }]);

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId, quantity: 2, displayName: 'Lavender Dreams', unitPrice: '12.99' }],
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.reference).toMatch(/^LOR-\d{8}-\d{4}$/);
    expect(body.status).toBe('new');
  });

  it('handles zero stock (all items need production)', async () => {
    const orderId = 'order-uuid-2';
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    // Reference generation: one existing order
    setupSelectChain([{ reference: 'LOR-20260523-0001' }]);

    // Insert order
    setupInsertChain([{ id: orderId, reference: 'LOR-20260523-0002', status: 'new', total: '25.98' }]);

    // Stock level: 0
    setupStockLevelChain(0);

    // Insert order line (no allocation)
    setupInsertChain([{ id: 'line-2' }]);

    // No stock movement insert since allocatedFromStock is 0

    // Insert notification attempt
    setupInsertChain([{ id: 'notif-2' }]);

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId, quantity: 3, displayName: 'Lavender Dreams', unitPrice: '8.66' }],
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.reference).toBe('LOR-20260523-0002');
  });

  it('is accessible without authentication', async () => {
    // No Authorization header needed
    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });
    // Should get 400 (validation), not 401 (auth)
    expect(res.status).toBe(400);
  });

  it('increments reference number for same day', async () => {
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    // Max reference today is LOR-20260523-0005
    setupSelectChain([{ reference: 'LOR-20260523-0005' }]);

    // Insert order
    setupInsertChain([{ id: 'order-3', reference: 'LOR-20260523-0006', status: 'new', total: '10.00' }]);

    // Stock level
    setupStockLevelChain(10);

    // Insert order line
    setupInsertChain([{ id: 'line-3' }]);

    // Insert stock movement
    setupInsertChain([{ id: 'movement-3' }]);

    // Insert notification attempt
    setupInsertChain([{ id: 'notif-3' }]);

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId, quantity: 1, displayName: 'Test Soap', unitPrice: '10.00' }],
        customerName: 'Test User',
        customerEmail: 'test@example.com',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.reference).toBe('LOR-20260523-0006');
  });
});
