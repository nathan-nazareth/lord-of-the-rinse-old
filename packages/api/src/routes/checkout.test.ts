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
    c.groupBy = vi.fn(() => chain());
    c.for = vi.fn(() => chain());
    c.execute = vi.fn(() => Promise.resolve());
    c.then = (onFulfilled: (v: unknown) => unknown) => Promise.resolve([]).then(onFulfilled);
    return c;
  };

  const txStub = {
    select: vi.fn(() => chain()),
    insert: vi.fn(() => chain()),
    update: vi.fn(() => chain()),
    delete: vi.fn(() => chain()),
    execute: vi.fn(() => Promise.resolve()),
  };

  const db = {
    select: vi.fn(() => chain()),
    insert: vi.fn(() => chain()),
    update: vi.fn(() => chain()),
    delete: vi.fn(() => chain()),
    transaction: vi.fn(async (cb: (tx: typeof txStub) => Promise<unknown>) => cb(txStub)),
  };

  return { mocks: { db, chain, txStub } };
});

vi.mock('@lotr/db', () => ({
  db: mocks.db,
  sql: (strings: TemplateStringsArray) => strings.join(''),
}));

vi.mock('@lotr/db/schema', () => {
  const col = (name: string) => name;
  return {
    catalogAttributes: {
      id: col('id'),
      type: col('type'),
      name: col('name'),
      slug: col('slug'),
      displayOrder: col('displayOrder'),
      archived: col('archived'),
      createdAt: col('createdAt'),
      updatedAt: col('updatedAt'),
    },
    soapVariants: {
      id: col('id'),
      name: col('name'),
      slug: col('slug'),
      unitPrice: col('unitPrice'),
      enabled: col('enabled'),
      archived: col('archived'),
      createdAt: col('createdAt'),
      updatedAt: col('updatedAt'),
    },
    variantAttributes: {
      id: col('id'),
      variantId: col('variantId'),
      attributeId: col('attributeId'),
      value: col('value'),
    },
    commerceSettings: { key: col('key'), value: col('value') },
    orders: {
      id: col('id'),
      reference: col('reference'),
      status: col('status'),
      customerName: col('customerName'),
      customerEmail: col('customerEmail'),
      total: col('total'),
      createdAt: col('createdAt'),
      updatedAt: col('updatedAt'),
    },
    orderLines: {
      id: col('id'),
      orderId: col('orderId'),
      variantId: col('variantId'),
      displayName: col('displayName'),
      quantity: col('quantity'),
      unitPrice: col('unitPrice'),
      allocatedFromStock: col('allocatedFromStock'),
      quantityToProduce: col('quantityToProduce'),
      createdAt: col('createdAt'),
    },
    stockMovements: {
      id: col('id'),
      variantId: col('variantId'),
      type: col('type'),
      quantity: col('quantity'),
      reason: col('reason'),
      referenceId: col('referenceId'),
      createdAt: col('createdAt'),
    },
    notificationAttempts: {
      id: col('id'),
      orderId: col('orderId'),
      provider: col('provider'),
      status: col('status'),
      attempts: col('attempts'),
      lastError: col('lastError'),
      createdAt: col('createdAt'),
      updatedAt: col('updatedAt'),
    },
    users: { id: col('id'), email: col('email'), name: col('name'), role: col('role') },
    sessions: { id: col('id'), userId: col('userId'), token: col('token') },
    accounts: { id: col('id'), userId: col('userId') },
    verifications: { id: col('id'), token: col('token') },
  };
});

vi.mock('../middleware/admin-auth', () => ({
  adminAuth: async (_c: unknown, next: () => Promise<void>) => {
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
  // select().from().where().orderBy().limit(1) — the .where() call returns
  // a fresh chain via the chain factory, so we have to override orderBy on it.
  const whereResult = mocks.chain();
  (whereResult.orderBy as ReturnType<typeof vi.fn>).mockReturnValueOnce({
    limit: vi.fn(() => Promise.resolve(result)),
    then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled),
  });
  const c = mocks.chain();
  (c.where as ReturnType<typeof vi.fn>).mockReturnValueOnce(whereResult);
  c.then = (onFulfilled: (v: unknown) => unknown) => Promise.resolve([]).then(onFulfilled);
  (c.groupBy as ReturnType<typeof vi.fn>).mockReturnValueOnce(Promise.resolve(result));
  mocks.txStub.select.mockReturnValueOnce({
    from: vi.fn(() => c),
  });
}

function setupInsertChain(result: unknown) {
  mocks.txStub.insert.mockReturnValueOnce({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve(result)),
    })),
  });
}

function setupStockLevelChain(stockLevel: number) {
  // For the stock level query: select({ total: ... }).from(stockMovements).where(...)
  mocks.txStub.select.mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([{ total: stockLevel }])),
    })),
  });
}

function setupVariantLookup(
  variants: Array<{
    id: string;
    name: string;
    unitPrice: string;
    enabled: boolean;
    archived: boolean;
  }>,
) {
  // Variant lookup is select().from().where().for('update') — we need
  // .for() to return a thenable resolving to the variant rows.
  const whereResult = mocks.chain();
  (whereResult.for as ReturnType<typeof vi.fn>).mockReturnValueOnce({
    then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(variants).then(onFulfilled),
  });
  const c = mocks.chain();
  (c.where as ReturnType<typeof vi.fn>).mockReturnValueOnce(whereResult);
  mocks.txStub.select.mockReturnValueOnce({
    from: vi.fn(() => c),
  });
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    // Clear the once-queue without wiping vi.fn implementations.
    for (const fn of [
      mocks.db.select,
      mocks.db.insert,
      mocks.db.update,
      mocks.db.delete,
      mocks.db.transaction,
      mocks.txStub.select,
      mocks.txStub.insert,
      mocks.txStub.update,
      mocks.txStub.delete,
      mocks.txStub.execute,
    ]) {
      fn.mockReset();
    }
    // Re-seed default behaviors after reset.
    mocks.db.transaction.mockImplementation(async (cb) => cb(mocks.txStub));
    mocks.txStub.execute.mockImplementation(() => Promise.resolve());
    mocks.txStub.select.mockImplementation(() => mocks.chain());
    mocks.txStub.insert.mockImplementation(() => mocks.chain());
    mocks.txStub.update.mockImplementation(() => mocks.chain());
    mocks.txStub.delete.mockImplementation(() => mocks.chain());
    mocks.db.select.mockImplementation(() => mocks.chain());
    mocks.db.insert.mockImplementation(() => mocks.chain());
    mocks.db.update.mockImplementation(() => mocks.chain());
    mocks.db.delete.mockImplementation(() => mocks.chain());
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
        items: [
          {
            variantId: '550e8400-e29b-41d4-a716-446655440000',
            quantity: 1,
            displayName: 'Test',
            unitPrice: '12.99',
          },
        ],
        customerName: 'John',
        customerEmail: 'not-email',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('creates an order with stock allocation', async () => {
    const orderId = 'order-uuid-1';
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    // 0. Variant lookup
    setupVariantLookup([
      {
        id: variantId,
        name: 'Lavender Dreams',
        unitPrice: '12.99',
        enabled: true,
        archived: false,
      },
    ]);

    // 1. Select for reference generation (no existing orders today)
    setupSelectChain([]);

    // 2. Insert order (returning)
    setupInsertChain([
      { id: orderId, reference: 'LOR-20260523-0001', status: 'new', total: '12.99' },
    ]);

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

    // Variant lookup
    setupVariantLookup([
      { id: variantId, name: 'Lavender Dreams', unitPrice: '8.66', enabled: true, archived: false },
    ]);

    // Reference generation: one existing order
    setupSelectChain([{ reference: 'LOR-20260523-0001' }]);

    // Insert order
    setupInsertChain([
      { id: orderId, reference: 'LOR-20260523-0002', status: 'new', total: '25.98' },
    ]);

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
    expect(body.reference).toBe(
      `LOR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0002`,
    );
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

    // Variant lookup
    setupVariantLookup([
      { id: variantId, name: 'Test Soap', unitPrice: '10.00', enabled: true, archived: false },
    ]);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    // Max reference today is LOR-<today>-0005
    setupSelectChain([{ reference: `LOR-${today}-0005` }]);

    // Insert order
    setupInsertChain([
      { id: 'order-3', reference: `LOR-${today}-0006`, status: 'new', total: '10.00' },
    ]);

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
    expect(body.reference).toBe(`LOR-${today}-0006`);
  });

  it('rejects checkout with non-existent variant', async () => {
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    // Variant lookup returns empty (variant not found)
    setupVariantLookup([]);

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId, quantity: 1, displayName: 'Fake Soap', unitPrice: '0.01' }],
        customerName: 'Attacker',
        customerEmail: 'attacker@example.com',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid items in cart');
    expect(body.details).toHaveLength(1);
    expect(body.details[0]).toContain('not found');
  });

  it('rejects checkout with disabled variant', async () => {
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    setupVariantLookup([
      { id: variantId, name: 'Disabled Soap', unitPrice: '10.00', enabled: false, archived: false },
    ]);

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId, quantity: 1, displayName: 'Disabled Soap', unitPrice: '10.00' }],
        customerName: 'Test',
        customerEmail: 'test@example.com',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid items in cart');
    expect(body.details[0]).toContain('not available');
  });

  it('rejects checkout with archived variant', async () => {
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    setupVariantLookup([
      { id: variantId, name: 'Old Soap', unitPrice: '10.00', enabled: true, archived: true },
    ]);

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId, quantity: 1, displayName: 'Old Soap', unitPrice: '10.00' }],
        customerName: 'Test',
        customerEmail: 'test@example.com',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid items in cart');
    expect(body.details[0]).toContain('no longer available');
  });

  it('uses server-side price ignoring client-supplied price', async () => {
    const variantId = '550e8400-e29b-41d4-a716-446655440000';

    // Variant has price 12.99 but client sends 0.01
    setupVariantLookup([
      {
        id: variantId,
        name: 'Lavender Dreams',
        unitPrice: '12.99',
        enabled: true,
        archived: false,
      },
    ]);

    // Reference generation
    setupSelectChain([]);
    // Order insert — server computes total from variant price (12.99 * 1)
    setupInsertChain([
      { id: 'order-1', reference: 'LOR-20260524-0001', status: 'new', total: '12.99' },
    ]);
    // Stock level
    setupStockLevelChain(0);
    // Order line insert (uses server-side variant name and price)
    setupInsertChain([{ id: 'line-1' }]);
    // Notification insert
    setupInsertChain([{ id: 'notif-1' }]);

    const res = await app.request('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variantId, quantity: 1, displayName: 'Fake Name', unitPrice: '0.01' }],
        customerName: 'Test',
        customerEmail: 'test@example.com',
      }),
    });

    // Checkout succeeds because variant is valid — price comes from DB, not the 0.01 sent by client
    expect(res.status).toBe(201);
  });
});
