import { adminDb, adminDiscounts } from '@lotr/db/admin';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_PERCENTAGE = 100;
const MIN_PERCENTAGE = 0;

const discountsRoutes = new Hono();

discountsRoutes.use('/*', adminAuth);

discountsRoutes.get('/', async (c) => {
  const discounts = await adminDb.select().from(adminDiscounts);
  return c.json(discounts);
});

discountsRoutes.post('/', async (c) => {
  let body: { percentage?: unknown; description?: unknown; active?: unknown };
  try {
    body = (await c.req.json()) as typeof body;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (
    typeof body.description !== 'string' ||
    body.description.trim().length === 0 ||
    body.description.length > MAX_DESCRIPTION_LENGTH
  ) {
    return c.json(
      {
        error: `Description is required and must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
      },
      422,
    );
  }

  if (
    !Number.isInteger(body.percentage) ||
    (body.percentage as number) < MIN_PERCENTAGE ||
    (body.percentage as number) > MAX_PERCENTAGE
  ) {
    return c.json({ error: `Percentage must be an integer between 0 and ${MAX_PERCENTAGE}` }, 422);
  }

  // Coerce active to 0/1; anything other than 0 collapses to 1 to keep the
  // column consistent.
  let active = 1;
  if (body.active === 0 || body.active === '0' || body.active === false) active = 0;

  const now = new Date().toISOString();
  const result = await adminDb
    .insert(adminDiscounts)
    .values({
      percentage: body.percentage as number,
      description: body.description.trim(),
      active,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(result[0], 201);
});

discountsRoutes.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  let body: { percentage?: unknown; description?: unknown; active?: unknown };
  try {
    body = (await c.req.json()) as typeof body;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (
    body.percentage !== undefined &&
    (!Number.isInteger(body.percentage) ||
      (body.percentage as number) < MIN_PERCENTAGE ||
      (body.percentage as number) > MAX_PERCENTAGE)
  ) {
    return c.json(
      { error: `Percentage must be an integer between 0 and ${MAX_PERCENTAGE}` },
      422,
    );
  }

  let trimmedDescription: string | undefined;
  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.length > MAX_DESCRIPTION_LENGTH) {
      return c.json(
        {
          error: `Description must be a string of at most ${MAX_DESCRIPTION_LENGTH} characters`,
        },
        422,
      );
    }
    trimmedDescription = body.description.trim();
  }

  const now = new Date().toISOString();
  const patch: { percentage?: number; description?: string; active?: number; updatedAt: string } = {
    updatedAt: now,
  };
  if (body.percentage !== undefined) patch.percentage = body.percentage as number;
  if (trimmedDescription !== undefined) patch.description = trimmedDescription;
  if (body.active !== undefined) {
    patch.active =
      body.active === 0 || body.active === '0' || body.active === false ? 0 : 1;
  }

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
