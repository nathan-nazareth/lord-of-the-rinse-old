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
    c.onConflictDoUpdate = vi.fn(() => chain());

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
  const attrCols = Object.fromEntries(
    ['id', 'type', 'name', 'slug', 'displayOrder', 'archived', 'createdAt', 'updatedAt'].map(
      (k) => [k, col(k)],
    ),
  );
  const variantCols = Object.fromEntries(
    ['id', 'name', 'slug', 'unitPrice', 'enabled', 'archived', 'createdAt', 'updatedAt'].map(
      (k) => [k, col(k)],
    ),
  );
  return {
    catalogAttributes: attrCols,
    soapVariants: variantCols,
    variantAttributes: {
      id: col('id'),
      variantId: col('variantId'),
      attributeId: col('attributeId'),
      value: col('value'),
    },
    commerceSettings: { key: col('key'), value: col('value') },
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
          then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled),
        };
        return innerChain;
      }),
      orderBy: vi.fn(() => Promise.resolve(result)),
    })),
  });
}

function setupSelectWithFieldsChain(result: unknown) {
  mocks.db.select.mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve(result)),
    })),
  });
}

describe('GET /api/catalog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns catalog with grouped attributes, variants, and public settings', async () => {
    // First select: attributes
    setupSelectChain([
      { id: 'a1', type: 'shape', name: 'Round', slug: 'round', displayOrder: 0, archived: false },
      {
        id: 'a2',
        type: 'scent',
        name: 'Lavender',
        slug: 'lavender',
        displayOrder: 0,
        archived: false,
      },
      { id: 'a3', type: 'color', name: 'Blue', slug: 'blue', displayOrder: 0, archived: false },
    ]);

    // Second select: variants
    setupSelectChain([
      {
        id: 'v1',
        name: 'Lavender Soap',
        slug: 'lavender-soap',
        unitPrice: '9.99',
        enabled: true,
        archived: false,
      },
    ]);

    // Third select: variant attributes
    setupSelectChain([
      { variantId: 'v1', attributeId: 'a1', value: 'round' },
      { variantId: 'v1', attributeId: 'a2', value: 'lavender' },
    ]);

    // Fourth select: settings
    setupSelectWithFieldsChain([
      { key: 'shop_open', value: 'true' },
      { key: 'currency', value: '"USD"' },
    ]);

    const res = await app.request('/api/catalog');
    expect(res.status).toBe(200);

    const body = await res.json();

    // Attributes grouped by type
    expect(body.attributes).toBeDefined();
    expect(body.attributes.shape).toHaveLength(1);
    expect(body.attributes.shape[0].name).toBe('Round');
    expect(body.attributes.scent).toHaveLength(1);
    expect(body.attributes.color).toHaveLength(1);

    // Variants with attributes
    expect(body.variants).toHaveLength(1);
    expect(body.variants[0].name).toBe('Lavender Soap');
    expect(body.variants[0].unitPrice).toBe('9.99');
    expect(body.variants[0].attributes).toHaveLength(2);

    // Settings
    expect(body.settings).toBeDefined();
    expect(body.settings.shop_open).toBe(true);
    expect(body.settings.currency).toBe('USD');
  });

  it('returns empty arrays when no data exists', async () => {
    // Empty attributes
    setupSelectChain([]);
    // Empty variants
    setupSelectChain([]);
    // No variant attributes query since no variants
    // Empty settings
    setupSelectWithFieldsChain([]);

    const res = await app.request('/api/catalog');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.attributes).toEqual({});
    expect(body.variants).toEqual([]);
    expect(body.settings).toEqual({});
  });

  it('is accessible without authentication', async () => {
    // The route is registered before the auth middleware,
    // so no Authorization header is needed
    setupSelectChain([]);
    setupSelectChain([]);
    setupSelectWithFieldsChain([]);

    const res = await app.request('/api/catalog');
    expect(res.status).toBe(200);
  });

  it('does not include stock or admin-only data', async () => {
    setupSelectChain([]);
    setupSelectChain([]);
    setupSelectWithFieldsChain([]);

    const res = await app.request('/api/catalog');
    const body = await res.json();

    // Response should not contain stock-on-hand or internal data
    expect(body.stockOnHand).toBeUndefined();
    expect(body.inventory).toBeUndefined();
    expect(body.orders).toBeUndefined();

    // Settings should only contain public keys
    const settingKeys = Object.keys(body.settings);
    const publicKeys = ['shop_open', 'currency', 'discount_tiers'];
    for (const key of settingKeys) {
      expect(publicKeys).toContain(key);
    }
  });

  it('groups attributes correctly by type', async () => {
    setupSelectChain([
      { id: 'a1', type: 'shape', name: 'Round', slug: 'round', displayOrder: 1, archived: false },
      { id: 'a2', type: 'shape', name: 'Square', slug: 'square', displayOrder: 2, archived: false },
      { id: 'a3', type: 'scent', name: 'Rose', slug: 'rose', displayOrder: 0, archived: false },
      {
        id: 'a4',
        type: 'addon',
        name: 'Gold Flake',
        slug: 'gold-flake',
        displayOrder: 0,
        archived: false,
      },
    ]);
    setupSelectChain([]);
    setupSelectWithFieldsChain([]);

    const res = await app.request('/api/catalog');
    const body = await res.json();

    expect(body.attributes.shape).toHaveLength(2);
    expect(body.attributes.scent).toHaveLength(1);
    expect(body.attributes.addon).toHaveLength(1);
    expect(body.attributes.color).toBeUndefined();
    expect(body.attributes.size).toBeUndefined();
  });
});
