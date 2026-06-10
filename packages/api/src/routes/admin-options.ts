import { adminDb, adminOptions } from '@lotr/db/admin';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

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
  let body: {
    minPrice: number;
    maxPrice: number;
    minSize: number;
    maxSize: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (
    !Number.isInteger(body.minPrice) ||
    !Number.isInteger(body.maxPrice) ||
    !Number.isInteger(body.minSize) ||
    !Number.isInteger(body.maxSize)
  ) {
    return c.json({ error: 'Numeric fields must be integers' }, 422);
  }

  if (body.maxPrice < body.minPrice) {
    return c.json({ error: 'maxPrice must be >= minPrice' }, 422);
  }
  if (body.maxSize < body.minSize) {
    return c.json({ error: 'maxSize must be >= minSize' }, 422);
  }

  const now = new Date().toISOString();
  const existing = await adminDb.select().from(adminOptions).limit(1);

  if (existing[0]) {
    const result = await adminDb
      .update(adminOptions)
      .set({
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        minSize: body.minSize,
        maxSize: body.maxSize,
        updatedAt: now,
      })
      .where(eq(adminOptions.id, existing[0].id))
      .returning();
    return c.json(result[0]);
  } else {
    const result = await adminDb
      .insert(adminOptions)
      .values({
        id: 1,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        minSize: body.minSize,
        maxSize: body.maxSize,
        updatedAt: now,
      })
      .returning();
    return c.json(result[0]);
  }
});

export default optionsRoutes;
