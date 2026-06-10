import { db, sql } from '@lotr/db';
import { orderLines, orders } from '@lotr/db/schema';
import { and, eq, gt, inArray } from 'drizzle-orm';
import { Hono } from 'hono';

const productionQueueRoutes = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

// Statuses that should appear in the production queue. Typed as a const
// tuple so `inArray` is statically checked against the column type.
const ACTIVE_STATUSES = ['new', 'processing'] as const;

// Get production queue grouped by variant
productionQueueRoutes.get('/', async (c) => {
  // Typed where clause: Drizzle generates parameterized SQL, so column
  // renames break the build instead of producing a silent runtime miscount.
  const rows = await db
    .select({
      variantId: orderLines.variantId,
      displayName: orderLines.displayName,
      quantityToProduce: orderLines.quantityToProduce,
      reference: orders.reference,
    })
    .from(orderLines)
    .innerJoin(orders, eq(orderLines.orderId, orders.id))
    .where(
      and(gt(orderLines.quantityToProduce, 0), inArray(orders.status, [...ACTIVE_STATUSES])),
    )
    .orderBy(orders.reference);

  // Group by variant
  const variantMap = new Map<
    string,
    {
      variantId: string | null;
      displayName: string;
      totalToProduce: number;
      orders: { reference: string; quantity: number }[];
    }
  >();

  for (const row of rows) {
    const key = row.variantId ?? `name:${row.displayName}`;
    const existing = variantMap.get(key);
    if (existing) {
      existing.totalToProduce += row.quantityToProduce;
      existing.orders.push({ reference: row.reference, quantity: row.quantityToProduce });
    } else {
      variantMap.set(key, {
        variantId: row.variantId,
        displayName: row.displayName,
        totalToProduce: row.quantityToProduce,
        orders: [{ reference: row.reference, quantity: row.quantityToProduce }],
      });
    }
  }

  return c.json({ queue: Array.from(variantMap.values()) });
});

export default productionQueueRoutes;
