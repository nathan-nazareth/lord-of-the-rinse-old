import { beforeEach, describe, expect, it, vi } from 'vitest';

// We use vi.hoisted() to create mocks that can be used in both vi.mock and tests
const { mocks } = vi.hoisted(() => {
  // Build a chainable mock that supports all Drizzle ORM patterns:
  // select().from().where()          -> resolves directly
  // select().from().where().orderBy() -> resolves after orderBy
  // update().set().where().returning() -> resolves after returning
  // insert().values().returning()     -> resolves after returning
  const chain = () => {
    const c = {} as Record<string, unknown>;
    // Make it thenable so `await chain()` resolves
    let _resolve: (v: unknown) => void;
    const _promise = new Promise((r) => {
      _resolve = r;
    });
    c.then = (onFulfilled: (v: unknown) => unknown) => _promise.then(onFulfilled);

    // Common chainable methods that return the chain itself
    c.orderBy = vi.fn(() => chain());
    c.returning = vi.fn(() => chain());
    c.where = vi.fn(() => chain());
    c.from = vi.fn(() => chain());
    c.set = vi.fn(() => chain());
    c.values = vi.fn(() => chain());

    // Store the resolve function so tests can control resolution
    c._resolve = (v: unknown) => _resolve!(v);
    return c;
  };

  const db = {
    select: vi.fn(() => chain()),
    insert: vi.fn(() => chain()),
    update: vi.fn(() => chain()),
  };

  return { mocks: { db, chain } };
});

vi.mock('@lotr/db', () => ({
  db: mocks.db,
  sql: (strings: TemplateStringsArray) => strings.join(''),
}));

// Mock @lotr/db/schema to provide table columns
vi.mock('@lotr/db/schema', () => {
  const col = (name: string) => name;
  const tableMock = Object.fromEntries(
    ['id', 'type', 'name', 'slug', 'displayOrder', 'archived', 'createdAt', 'updatedAt'].map(
      (k) => [k, col(k)],
    ),
  );
  return {
    catalogAttributes: tableMock,
    soapVariants: tableMock,
    variantAttributes: {
      id: col('id'),
      variantId: col('variantId'),
      attributeId: col('attributeId'),
      value: col('value'),
    },
    users: { id: col('id'), email: col('email'), name: col('name'), role: col('role') },
    sessions: { id: col('id'), userId: col('userId'), token: col('token') },
    accounts: { id: col('id'), userId: col('userId') },
    verifications: { id: col('id'), token: col('token') },
  };
});

// Mock @lotr/shared to provide schema validators
vi.mock('@lotr/shared', () => {
  const VALID_TYPES = ['shape', 'scent', 'color', 'size', 'addon'];

  function createAttributeSchema() {
    return {
      safeParse(data: unknown) {
        if (typeof data !== 'object' || data === null)
          return {
            success: false,
            error: { flatten: () => ({ fieldErrors: {}, formErrors: ['Invalid input'] }) },
          };
        const d = data as Record<string, unknown>;
        const errors: Record<string, string[]> = {};
        if (!VALID_TYPES.includes(d.type as string)) errors.type = ['Invalid type'];
        if (typeof d.name !== 'string' || d.name.length === 0) errors.name = ['Name is required'];
        if (typeof d.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug))
          errors.slug = ['Invalid slug'];
        if (Object.keys(errors).length > 0)
          return {
            success: false as const,
            error: { flatten: () => ({ fieldErrors: errors, formErrors: [] }) },
          };
        return {
          success: true as const,
          data: {
            type: d.type,
            name: d.name,
            slug: d.slug,
            displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : 0,
          },
        };
      },
    };
  }

  function updateAttributeSchema() {
    return {
      safeParse(data: unknown) {
        if (typeof data !== 'object' || data === null)
          return {
            success: false,
            error: { flatten: () => ({ fieldErrors: {}, formErrors: ['Invalid input'] }) },
          };
        const d = data as Record<string, unknown>;
        const errors: Record<string, string[]> = {};
        if ('name' in d && (typeof d.name !== 'string' || d.name.length === 0))
          errors.name = ['Name is required'];
        if (
          'slug' in d &&
          (typeof d.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug))
        )
          errors.slug = ['Invalid slug'];
        if (Object.keys(errors).length > 0)
          return {
            success: false as const,
            error: { flatten: () => ({ fieldErrors: errors, formErrors: [] }) },
          };
        return { success: true as const, data: d };
      },
    };
  }

  return {
    createAttributeSchema: createAttributeSchema(),
    updateAttributeSchema: updateAttributeSchema(),
    attributeTypeSchema: {
      safeParse(val: unknown) {
        return { success: VALID_TYPES.includes(val as string) };
      },
    },
  };
});

// Mock auth middleware to bypass auth checks
vi.mock('../middleware/admin-auth', () => ({
  adminAuth: async (_c: unknown, next: () => Promise<void>) => {
    await next();
  },
}));

// Must import app AFTER mocks are set up
import { app } from '../index';

// Helper to resolve the latest chain created by a db operation
// Since each chain has a `then`, awaiting the chain triggers the promise
// We need to pre-resolve chains with mock data
function setupSelectChain(result: unknown) {
  const c = mocks.chain();
  // The select chain: db.select() -> chain with from
  // db.select() already returns a chain; we need to make the whole chain resolve to `result`
  // We override db.select to return a chain that resolves properly
  mocks.db.select.mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => {
        // Make it thenable AND have orderBy
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
  // For PATCH: first a select to check existence, then update
  // For DELETE: first a select, then update (archive)
  // First call: select (check existence)
  setupSelectChain(existing ? [existing] : []);
  // Second call: update
  mocks.db.update.mockReturnValueOnce({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve(result)),
      })),
    })),
  });
}

describe('GET /api/admin/attributes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns list of attributes', async () => {
    setupSelectChain([
      {
        id: '1',
        type: 'scent',
        name: 'Lavender',
        slug: 'lavender',
        displayOrder: 0,
        archived: false,
      },
    ]);

    const res = await app.request('/api/admin/attributes');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.attributes).toHaveLength(1);
    expect(body.attributes[0].name).toBe('Lavender');
  });

  it('filters by type', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/attributes?type=scent');
    expect(res.status).toBe(200);
  });

  it('rejects invalid type filter', async () => {
    const res = await app.request('/api/admin/attributes?type=invalid');
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe('Invalid type filter');
  });

  it('includes archived when flag is set', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/attributes?includeArchived=true');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/attributes/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns a single attribute', async () => {
    setupSelectChain([
      {
        id: 'abc-123',
        type: 'scent',
        name: 'Lavender',
        slug: 'lavender',
        displayOrder: 0,
        archived: false,
      },
    ]);

    const res = await app.request('/api/admin/attributes/abc-123');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.attribute.name).toBe('Lavender');
  });

  it('returns 404 when not found', async () => {
    setupSelectChain([]);

    const res = await app.request('/api/admin/attributes/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/attributes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates an attribute', async () => {
    // First select: duplicate slug check (no results)
    setupSelectChain([]);
    // Insert
    setupInsertChain([
      { id: 'new-id', type: 'scent', name: 'Rose', slug: 'rose', displayOrder: 0, archived: false },
    ]);

    const res = await app.request('/api/admin/attributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'scent', name: 'Rose', slug: 'rose' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.attribute.name).toBe('Rose');
  });

  it('rejects invalid input', async () => {
    const res = await app.request('/api/admin/attributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'invalid', name: '', slug: '' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('rejects duplicate slug', async () => {
    // First select: duplicate slug found
    setupSelectChain([{ id: 'existing-id' }]);

    const res = await app.request('/api/admin/attributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'scent', name: 'Rose', slug: 'rose' }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain('already exists');
  });
});

describe('PATCH /api/admin/attributes/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('updates an attribute', async () => {
    setupUpdateChain(
      { id: 'abc', type: 'scent', name: 'Lavender', slug: 'lavender', displayOrder: 0 },
      [{ id: 'abc', type: 'scent', name: 'Lavender Supreme', slug: 'lavender', displayOrder: 0 }],
    );

    const res = await app.request('/api/admin/attributes/abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Lavender Supreme' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.attribute.name).toBe('Lavender Supreme');
  });

  it('returns 404 for nonexistent attribute', async () => {
    setupUpdateChain(null, []);

    const res = await app.request('/api/admin/attributes/nonexistent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(404);
  });

  it('rejects duplicate slug on update', async () => {
    // First select: existing attribute found
    setupSelectChain([
      { id: 'abc', type: 'scent', name: 'Lavender', slug: 'lavender', displayOrder: 0 },
    ]);
    // Second select: slug conflict check
    setupSelectChain([{ id: 'other-id' }]);

    const res = await app.request('/api/admin/attributes/abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'taken-slug' }),
    });

    expect(res.status).toBe(409);
  });

  it('archives an attribute', async () => {
    setupUpdateChain(
      { id: 'abc', type: 'scent', name: 'Lavender', slug: 'lavender', displayOrder: 0 },
      [
        {
          id: 'abc',
          type: 'scent',
          name: 'Lavender',
          slug: 'lavender',
          displayOrder: 0,
          archived: true,
        },
      ],
    );

    const res = await app.request('/api/admin/attributes/abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('attribute');
    expect(body.attribute.archived).toBe(true);
  });
});

describe('DELETE /api/admin/attributes/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('archives an attribute via DELETE', async () => {
    setupUpdateChain(
      { id: 'abc', type: 'scent', name: 'Lavender', slug: 'lavender', displayOrder: 0 },
      [
        {
          id: 'abc',
          type: 'scent',
          name: 'Lavender',
          slug: 'lavender',
          displayOrder: 0,
          archived: true,
        },
      ],
    );

    const res = await app.request('/api/admin/attributes/abc', {
      method: 'DELETE',
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.attribute.archived).toBe(true);
  });

  it('returns 404 for nonexistent attribute', async () => {
    setupUpdateChain(null, []);

    const res = await app.request('/api/admin/attributes/nonexistent', {
      method: 'DELETE',
    });

    expect(res.status).toBe(404);
  });
});
