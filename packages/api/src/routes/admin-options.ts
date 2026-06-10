import { adminDb, adminOptions } from '@lotr/db/admin';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

const MAX_BOUND = 1_000_000;

const optionsRoutes = new Hono();

optionsRoutes.use('/*', adminAuth);

optionsRoutes.get('/', async (c) => {
  const opts = await adminDb.select().from(adminOptions).limit(1);
  if (!opts[0]) {
    return c.json({ error: 'Options not configured' }, 404);
  }
  return c.json(opts[0]);
});

optionsRoutes.put('/', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (typeof raw !== 'object' || raw === null) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  const body = raw as Record<string, unknown>;
  const fields = ['minPrice', 'maxPrice', 'minSize', 'maxSize'] as const;

  const values: Record<string, number> = {};
  for (const field of fields) {
    const v = body[field];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > MAX_BOUND) {
      return c.json(
        { error: `${field} must be a non-negative integer ≤ ${MAX_BOUND}` },
        422,
      );
    }
    values[field] = v;
  }

  if (values.maxPrice < values.minPrice) {
    return c.json({ error: 'maxPrice must be >= minPrice' }, 422);
  }
  if (values.maxSize < values.minSize) {
    return c.json({ error: 'maxSize must be >= minSize' }, 422);
  }

  const now = new Date().toISOString();
  // Atomic upsert: avoids the SELECT-then-INSERT/UPDATE race that
  // produced SQLITE_CONSTRAINT_PRIMARYKEY 500s on cold starts.
  const result = await adminDb
    .insert(adminOptions)
    .values({
      id: 1,
      minPrice: values.minPrice,
      maxPrice: values.maxPrice,
      minSize: values.minSize,
      maxSize: values.maxSize,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: adminOptions.id,
      set: {
        minPrice: values.minPrice,
        maxPrice: values.maxPrice,
        minSize: values.minSize,
        maxSize: values.maxSize,
        updatedAt: now,
      },
    })
    .returning();

  return c.json(result[0]);
});

export default optionsRoutes;
