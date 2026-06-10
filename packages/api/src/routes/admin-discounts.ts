import { adminDb, adminDiscounts } from '@lotr/db/admin';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

const discountsRoutes = new Hono();

discountsRoutes.use('/*', adminAuth);

discountsRoutes.get('/', async (c) => {
  const discounts = await adminDb.select().from(adminDiscounts);
  return c.json(discounts);
});

discountsRoutes.post('/', async (c) => {
  let body: { percentage: number; description: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (
    !Number.isInteger(body.percentage) ||
    typeof body.description !== 'string' ||
    body.description.trim().length === 0
  ) {
    return c.json({ error: 'Invalid discount fields' }, 422);
  }

  if (body.percentage < 0 || body.percentage > 100) {
    return c.json({ error: 'Percentage must be between 0 and 100' }, 422);
  }

  const now = new Date().toISOString();
  const result = await adminDb
    .insert(adminDiscounts)
    .values({ percentage: body.percentage, description: body.description.trim(), active: 1, createdAt: now, updatedAt: now })
    .returning();

  return c.json(result[0], 201);
});

discountsRoutes.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  let body: { percentage?: number; description?: string; active?: number };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (
    body.percentage !== undefined &&
    (!Number.isInteger(body.percentage) || body.percentage < 0 || body.percentage > 100)
  ) {
    return c.json({ error: 'Percentage must be an integer between 0 and 100' }, 422);
  }

  const trimmedDescription =
    typeof body.description === 'string' ? body.description.trim() : undefined;

  const now = new Date().toISOString();
  const patch: { percentage?: number; description?: string; active?: number; updatedAt: string } = {
    updatedAt: now,
  };
  if (body.percentage !== undefined) patch.percentage = body.percentage;
  if (trimmedDescription !== undefined) patch.description = trimmedDescription;
  if (body.active !== undefined) patch.active = body.active;

  const result = await adminDb
    .update(adminDiscounts)
    .set(patch)
    .where(eq(adminDiscounts.id, id))
    .returning();

  if (!result[0]) {
    return c.json({ error: 'Discount not found' }, 404);
  }
  return c.json(result[0]);
});

discountsRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid id' }, 400);
  }
  const discount = await adminDb
    .select()
    .from(adminDiscounts)
    .where(eq(adminDiscounts.id, id))
    .limit(1);

  if (!discount[0]) {
    return c.json({ error: 'Discount not found' }, 404);
  }

  await adminDb.delete(adminDiscounts).where(eq(adminDiscounts.id, id));
  return c.json({ success: true });
});

export default discountsRoutes;
