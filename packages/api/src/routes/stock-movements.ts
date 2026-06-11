import { db, sql } from '@lotr/db';
import { soapVariants, stockMovements } from '@lotr/db/schema';
import { movementTypeSchema, stockAdjustmentSchema } from '@lotr/shared';
import { and, desc, eq, gte, inArray, lte, type SQL } from 'drizzle-orm';
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

  const conditions: SQL[] = [];

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
    const fromDate = new Date(from);
    if (!Number.isFinite(fromDate.getTime())) {
      return c.json({ error: 'Invalid "from" date parameter' }, 400);
    }
    conditions.push(gte(stockMovements.createdAt, fromDate));
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isFinite(toDate.getTime())) {
      return c.json({ error: 'Invalid "to" date parameter' }, 400);
    }
    conditions.push(lte(stockMovements.createdAt, toDate));
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
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId))
    return c.json({ error: 'Invalid variant ID format' }, 400);

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

  // Wrap the existence check, balance check, and insert in a single
  // transaction with a row lock on the variant so two concurrent negative
  // adjustments can't both observe the same starting balance and over-allocate.
  try {
    const result = await db.transaction(async (tx) => {
      const [variant] = await tx
        .select({ id: soapVariants.id })
        .from(soapVariants)
        .where(eq(soapVariants.id, variantId))
        .for('update');

      if (!variant) {
        return { notFound: true as const };
      }

      if (quantity < 0) {
        const [current] = await tx
          .select({
            total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)`,
          })
          .from(stockMovements)
          .where(eq(stockMovements.variantId, variantId));

        const currentStock = Number(current.total);
        if (currentStock + quantity < 0) {
          return { insufficient: true as const, currentStock, requestedChange: quantity };
        }
      }

      const [movement] = await tx
        .insert(stockMovements)
        .values({
          variantId,
          type: 'adjustment',
          quantity,
          reason,
        })
        .returning();

      return { movement };
    });

    if ('notFound' in result) {
      return c.json({ error: 'Variant not found' }, 404);
    }
    if ('insufficient' in result) {
      return c.json(
        {
          error: 'Insufficient stock',
          currentStock: result.currentStock,
          requestedChange: result.requestedChange,
        },
        400,
      );
    }
    return c.json({ movement: result.movement }, 201);
  } catch (err) {
    console.error('[stock-movements] adjustment failed:', err);
    return c.json({ error: 'Failed to record stock movement' }, 500);
  }
});

export default stockMovementsRoutes;
