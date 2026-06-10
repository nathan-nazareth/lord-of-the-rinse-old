import { db, sql } from '@lotr/db';
import { orderLines, orders } from '@lotr/db/schema';
import { Hono } from 'hono';

const productionQueueRoutes = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

// Get production queue grouped by variant
productionQueueRoutes.get('/', async (c) => {
  // Query order lines with quantityToProduce > 0 joined with orders in new/processing status
  const rows = await db
    .select({
      variantId: orderLines.variantId,
      displayName: orderLines.displayName,
      quantityToProduce: orderLines.quantityToProduce,
      reference: orders.reference,
    })
    .from(orderLines)
    .innerJoin(orders, sql`${orderLines.orderId} = ${orders.id}`)
    .where(sql`${orderLines.quantityToProduce} > 0 AND ${orders.status} IN ('new', 'processing')`)
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
