import { db, sql } from '@lotr/db';
import { soapVariants, stockMovements } from '@lotr/db/schema';
import { movementTypeSchema, stockAdjustmentSchema } from '@lotr/shared';
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { Hono } from 'hono';

const stockMovementsRoutes = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

// List stock movements with optional filters
stockMovementsRoutes.get('/', async (c) => {
  const variantId = c.req.query('variantId');
  const type = c.req.query('type');
  const from = c.req.query('from');
  const to = c.req.query('to');

  const conditions = [];

  if (variantId) {
    conditions.push(eq(stockMovements.variantId, variantId));
  }

  if (type) {
    const parsed = movementTypeSchema.safeParse(type);
    if (parsed.success) {
      conditions.push(eq(stockMovements.type, parsed.data));
    }
  }

  if (from) {
    conditions.push(gte(stockMovements.createdAt, new Date(from)));
  }

  if (to) {
    conditions.push(lte(stockMovements.createdAt, new Date(to)));
  }

  const movements = await db
    .select()
    .from(stockMovements)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(stockMovements.createdAt));

  return c.json({ movements });
});

// Get current stock level for a variant
stockMovementsRoutes.get('/stock-level/:variantId', async (c) => {
  const variantId = c.req.param('variantId');

  // Verify variant exists
  const [variant] = await db
    .select({ id: soapVariants.id })
    .from(soapVariants)
    .where(eq(soapVariants.id, variantId));

  if (!variant) {
    return c.json({ error: 'Variant not found' }, 404);
  }

  // Sum all movements for this variant
  const [result] = await db
    .select({
      total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)`,
    })
    .from(stockMovements)
    .where(eq(stockMovements.variantId, variantId));

  return c.json({ variantId, stock: Number(result.total) });
});

// Get stock levels for all variants
stockMovementsRoutes.get('/stock-levels', async (c) => {
  const variants = await db.select().from(soapVariants).where(eq(soapVariants.archived, false));

  const variantIds = variants.map((v) => v.id);

  if (variantIds.length === 0) {
    return c.json({ stockLevels: [] });
  }

  // Get stock totals per variant
  const totals = await db
    .select({
      variantId: stockMovements.variantId,
      total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)`,
    })
    .from(stockMovements)
    .where(inArray(stockMovements.variantId, variantIds))
    .groupBy(stockMovements.variantId);

  const totalsMap = new Map(totals.map((t) => [t.variantId, Number(t.total)]));

  const stockLevels = variants.map((v) => ({
    variantId: v.id,
    variantName: v.name,
    stock: totalsMap.get(v.id) || 0,
  }));

  return c.json({ stockLevels });
});

// Create a stock movement (adjust stock)
stockMovementsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = stockAdjustmentSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { variantId, quantity, reason } = parsed.data;

  // Verify variant exists
  const [variant] = await db
    .select({ id: soapVariants.id })
    .from(soapVariants)
    .where(eq(soapVariants.id, variantId));

  if (!variant) {
    return c.json({ error: 'Variant not found' }, 404);
  }

  // If quantity is negative, check that resulting stock won't go below 0
  if (quantity < 0) {
    const [current] = await db
      .select({
        total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)`,
      })
      .from(stockMovements)
      .where(eq(stockMovements.variantId, variantId));

    const currentStock = Number(current.total);
    if (currentStock + quantity < 0) {
      return c.json(
        {
          error: 'Insufficient stock',
          currentStock,
          requestedChange: quantity,
        },
        400,
      );
    }
  }

  const [movement] = await db
    .insert(stockMovements)
    .values({
      variantId,
      type: 'adjustment',
      quantity,
      reason,
    })
    .returning();

  return c.json({ movement }, 201);
});

export default stockMovementsRoutes;
