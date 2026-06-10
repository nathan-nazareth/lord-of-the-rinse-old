import { adminDb, adminDiscounts } from '@lotr/db/admin';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_PERCENTAGE = 100;
const MIN_PERCENTAGE = 0;

function normalizeActive(raw: unknown): number {
  // Treat 0 / "0" / false / "false" / "no" / "off" as inactive. Anything
  // else collapses to active. This stops a hand-crafted `{ active: "no" }`
  // from silently enabling a discount.
  if (raw === 0 || raw === false) return 0;
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase();
    if (s === '0' || s === 'false' || s === 'no' || s === 'off') return 0;
  }
  return 1;
}

interface RawDiscountBody {
  percentage?: unknown;
  description?: unknown;
  active?: unknown;
}

function parseId(raw: string | undefined): number | null {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const discountsRoutes = new Hono();

discountsRoutes.use('/*', adminAuth);

discountsRoutes.get('/', async (c) => {
  const discounts = await adminDb.select().from(adminDiscounts);
  return c.json(discounts);
});

discountsRoutes.post('/', async (c) => {
  let body: RawDiscountBody;
  try {
    const raw: unknown = await c.req.json();
    if (typeof raw !== 'object' || raw === null) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    body = raw as RawDiscountBody;
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
    typeof body.percentage !== 'number' ||
    !Number.isInteger(body.percentage) ||
    body.percentage < MIN_PERCENTAGE ||
    body.percentage > MAX_PERCENTAGE
  ) {
    return c.json({ error: `Percentage must be an integer between 0 and ${MAX_PERCENTAGE}` }, 422);
  }

  const active = body.active === undefined ? 1 : normalizeActive(body.active);

  const now = new Date().toISOString();
  const result = await adminDb
    .insert(adminDiscounts)
    .values({
      percentage: body.percentage,
      description: body.description.trim(),
      active,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(result[0], 201);
});

discountsRoutes.put('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (id === null) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  let body: RawDiscountBody;
  try {
    const raw: unknown = await c.req.json();
    if (typeof raw !== 'object' || raw === null) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    body = raw as RawDiscountBody;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (
    body.percentage !== undefined &&
    (typeof body.percentage !== 'number' ||
      !Number.isInteger(body.percentage) ||
      body.percentage < MIN_PERCENTAGE ||
      body.percentage > MAX_PERCENTAGE)
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
  if (body.percentage !== undefined) patch.percentage = body.percentage;
  if (trimmedDescription !== undefined) patch.description = trimmedDescription;
  if (body.active !== undefined) {
    patch.active = normalizeActive(body.active);
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
  const id = parseId(c.req.param('id'));
  if (id === null) {
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
