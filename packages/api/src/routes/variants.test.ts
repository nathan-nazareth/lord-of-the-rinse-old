import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => {
  const chain = () => {
    const c = {} as Record<string, unknown>;
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
    // PATCH /api/admin/variants/:id wraps the update + attribute replacement
    // in a transaction for atomicity. The mock transaction simply forwards
    // `select`/`update`/`insert`/`delete` to the same vi.fn()s that the test
    // pre-arms with mockReturnValueOnce — that way `setupUpdateChain` keeps
    // working as-is.
    transaction: vi.fn(async (cb: (tx: typeof db) => Promise<unknown>) => {
      const tx = {
        select: db.select,
        insert: db.insert,
        update: db.update,
        delete: db.delete,
        transaction: vi.fn(),
      };
      return cb(tx);
    }),
  };

  return { mocks: { db, chain } };
});

vi.mock('@lotr/db', () => ({
  db: mocks.db,
  sql: (strings: TemplateStringsArray) => strings.join(''),
}));

vi.mock('@lotr/db/schema', () => {
  const col = (name: string) => name;
  const variantCols = Object.fromEntries(
    ['id', 'name', 'slug', 'unitPrice', 'enabled', 'archived', 'createdAt', 'updatedAt'].map(
      (k) => [k, col(k)],
    ),
  );
  const attrCols = Object.fromEntries(
    ['id', 'type', 'name', 'slug', 'displayOrder', 'archived', 'createdAt', 'updatedAt'].map(
      (k) => [k, col(k)],
    ),
  );
  return {
    soapVariants: variantCols,
    variantAttributes: {
      id: col('id'),
      variantId: col('variantId'),
      attributeId: col('attributeId'),
      value: col('value'),
    },
    catalogAttributes: attrCols,
    users: { id: col('id'), email: col('email'), name: col('name'), role: col('role') },
    sessions: { id: col('id'), userId: col('userId'), token: col('token') },
    accounts: { id: col('id'), userId: col('userId') },
    verifications: { id: col('id'), token: col('token') },
  };
});

vi.mock('@lotr/shared', () => {
  function createVariantSchema() {
    return {
      safeParse(data: unknown) {
        if (typeof data !== 'object' || data === null)
          return {
            success: false,
            error: { flatten: () => ({ fieldErrors: {}, formErrors: ['Invalid input'] }) },
          };
        const d = data as Record<string, unknown>;
        const errors: Record<string, string[]> = {};
        if (typeof d.name !== 'string' || d.name.length === 0) errors.name = ['Name is required'];
        if (typeof d.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug))
          errors.slug = ['Invalid slug'];
        if (typeof d.unitPrice !== 'string' || !/^\d+(\.\d{1,2})?$/.test(d.unitPrice))
          errors.unitPrice = ['Invalid price'];
        if (!Array.isArray(d.attributes) || d.attributes.length === 0)
          errors.attributes = ['At least one attribute is required'];
        if (Object.keys(errors).length > 0)
          return {
            success: false as const,
            error: { flatten: () => ({ fieldErrors: errors, formErrors: [] }) },
          };
        return { success: true as const, data: d };
      },
    };
  }

  function updateVariantSchema() {
    return {
      safeParse(data: unknown) {
        if (typeof data !== 'object' || data === null)
          return {
            success: false,
            error: { flatten: () => ({ fieldErrors: {}, formErrors: ['Invalid input'] }) },
          };
        return { success: true as const, data };
      },
    };
  }

  return {
    createVariantSchema: createVariantSchema(),
    updateVariantSchema: updateVariantSchema(),
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

function setupInsertChain(result: unknown) {
  mocks.db.insert.mockReturnValueOnce({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve(result)),
    })),
  });
}

function setupUpdateChain(existing: unknown, result: unknown) {
  setupSelectChain(existing ? [existing] : []);
  mocks.db.update.mockReturnValueOnce({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve(result)),
      })),
    })),
  });
}

describe('GET /api/admin/variants', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns list of variants with attributes', async () => {
    // First select: variants
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
    // Second select: variant_attributes
    setupSelectChain([{ id: 'va1', variantId: 'v1', attributeId: 'a1', value: 'lavender' }]);

    const res = await app.request('/api/admin/variants');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.variants).toHaveLength(1);
    expect(body.variants[0].name).toBe('Lavender Soap');
    expect(body.variants[0].attributes).toHaveLength(1);
  });

  it('includes archived when flag is set', async () => {
    setupSelectChain([]);
    setupSelectChain([]);

    const res = await app.request('/api/admin/variants?includeArchived=true');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/variants/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns a single variant with attributes', async () => {
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
    // Second select: attributes for the variant
    setupSelectChain([{ attributeId: 'a1', value: 'lavender' }]);

    const res = await app.request('/api/admin/variants/v1');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.variant.name).toBe('Lavender Soap');
    expect(body.variant.attributes).toHaveLength(1);
  });

  it('returns 404 when not found', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/variants/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/variants', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a variant with attributes', async () => {
    // First select: duplicate slug check (no results)
    setupSelectChain([]);
    // Second select: validate attribute IDs exist
    setupSelectChain([{ id: 'a1' }]);
    // Insert variant
    setupInsertChain([
      {
        id: 'v1',
        name: 'Rose Soap',
        slug: 'rose-soap',
        unitPrice: '12.99',
        enabled: true,
        archived: false,
      },
    ]);
    // Insert variant_attributes
    setupInsertChain([]);

    const res = await app.request('/api/admin/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rose Soap',
        slug: 'rose-soap',
        unitPrice: '12.99',
        attributes: [{ attributeId: 'a1', value: 'rose' }],
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.variant.name).toBe('Rose Soap');
  });

  it('rejects invalid input', async () => {
    const res = await app.request('/api/admin/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', slug: '', unitPrice: '', attributes: [] }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('rejects duplicate slug', async () => {
    setupSelectChain([{ id: 'existing-id' }]);

    const res = await app.request('/api/admin/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rose Soap',
        slug: 'rose-soap',
        unitPrice: '12.99',
        attributes: [{ attributeId: 'a1', value: 'rose' }],
      }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain('already exists');
  });

  it('rejects invalid attribute IDs', async () => {
    // No duplicate slug
    setupSelectChain([]);
    // Attribute IDs not found
    setupSelectChain([]);

    const res = await app.request('/api/admin/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rose Soap',
        slug: 'rose-soap',
        unitPrice: '12.99',
        attributes: [{ attributeId: 'bad-id', value: 'rose' }],
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('attribute IDs');
  });
});

describe('PATCH /api/admin/variants/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('updates a variant', async () => {
    setupUpdateChain(
      { id: 'v1', name: 'Lavender Soap', slug: 'lavender-soap', unitPrice: '9.99', enabled: true },
      [
        {
          id: 'v1',
          name: 'Lavender Deluxe',
          slug: 'lavender-soap',
          unitPrice: '9.99',
          enabled: true,
        },
      ],
    );
    // Select for current attributes (after update)
    setupSelectChain([{ attributeId: 'a1', value: 'lavender' }]);

    const res = await app.request('/api/admin/variants/v1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Lavender Deluxe' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.variant.name).toBe('Lavender Deluxe');
  });

  it('returns 404 for nonexistent variant', async () => {
    setupUpdateChain(null, []);

    const res = await app.request('/api/admin/variants/nonexistent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(404);
  });

  it('toggles enabled status', async () => {
    setupUpdateChain(
      { id: 'v1', name: 'Lavender Soap', slug: 'lavender-soap', unitPrice: '9.99', enabled: true },
      [
        {
          id: 'v1',
          name: 'Lavender Soap',
          slug: 'lavender-soap',
          unitPrice: '9.99',
          enabled: false,
        },
      ],
    );
    setupSelectChain([]);

    const res = await app.request('/api/admin/variants/v1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.variant.enabled).toBe(false);
  });

  it('archives a variant', async () => {
    setupUpdateChain(
      { id: 'v1', name: 'Lavender Soap', slug: 'lavender-soap', unitPrice: '9.99', enabled: true },
      [
        {
          id: 'v1',
          name: 'Lavender Soap',
          slug: 'lavender-soap',
          unitPrice: '9.99',
          enabled: true,
          archived: true,
        },
      ],
    );
    setupSelectChain([]);

    const res = await app.request('/api/admin/variants/v1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.variant.archived).toBe(true);
  });
});

describe('DELETE /api/admin/variants/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('archives a variant via DELETE', async () => {
    setupUpdateChain(
      { id: 'v1', name: 'Lavender Soap', slug: 'lavender-soap', unitPrice: '9.99', enabled: true },
      [
        {
          id: 'v1',
          name: 'Lavender Soap',
          slug: 'lavender-soap',
          unitPrice: '9.99',
          enabled: true,
          archived: true,
        },
      ],
    );
    // Select attributes for the response
    setupSelectChain([]);

    const res = await app.request('/api/admin/variants/v1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.variant.archived).toBe(true);
  });

  it('returns 404 for nonexistent variant', async () => {
    setupUpdateChain(null, []);

    const res = await app.request('/api/admin/variants/nonexistent', {
      method: 'DELETE',
    });

    expect(res.status).toBe(404);
  });
});
