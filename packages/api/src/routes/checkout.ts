import { Hono } from 'hono';
import { db, sql } from '@lotr/db';
import { orders, orderLines, stockMovements, notificationAttempts } from '@lotr/db/schema';
import { checkoutRequestSchema } from '@lotr/shared';
import { eq, and, gte, lte, like, desc } from 'drizzle-orm';
import { dispatchNotification } from '../lib/notifications';

const checkoutRoutes = new Hono();

/**
 * Generate the next order reference for today in format LOR-YYYYMMDD-NNNN.
 * Queries today's max reference and increments.
 */
async function generateOrderReference(): Promise<string> {
  const today = new Date();
  const dateStr = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  const prefix = `LOR-${dateStr}-`;

  // Get today's max reference
  const [result] = await db
    .select({
      reference: orders.reference,
    })
    .from(orders)
    .where(like(orders.reference, `${prefix}%`))
    .orderBy(desc(orders.reference))
    .limit(1);

  let nextNum = 1;
  if (result) {
    const currentNum = Number.parseInt(result.reference.slice(-4), 10);
    nextNum = currentNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

/**
 * Get current stock level for a variant (sum of all movements).
 */
async function getStockLevel(variantId: string): Promise<number> {
  const [result] = await db
    .select({
      total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)`,
    })
    .from(stockMovements)
    .where(eq(stockMovements.variantId, variantId));

  return Number(result.total);
}

checkoutRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { items, customerName, customerEmail } = parsed.data;

  // Calculate total from line items
  let totalCents = 0;
  for (const item of items) {
    const price = Number.parseFloat(item.unitPrice);
    if (Number.isNaN(price) || price < 0) {
      return c.json({ error: `Invalid unitPrice for item: ${item.displayName}` }, 400);
    }
    totalCents += Math.round(price * 100) * item.quantity;
  }

  const total = (totalCents / 100).toFixed(2);

  // Generate order reference
  const reference = await generateOrderReference();

  // Create the order
  const [order] = await db
    .insert(orders)
    .values({
      reference,
      status: 'new',
      customerName,
      customerEmail,
      total,
    })
    .returning();

  // Process each line item: allocate stock and create order line
  for (const item of items) {
    const currentStock = await getStockLevel(item.variantId);
    const allocatedFromStock = Math.min(currentStock, item.quantity);
    const quantityToProduce = item.quantity - allocatedFromStock;

    // Create order line
    await db.insert(orderLines).values({
      orderId: order.id,
      variantId: item.variantId,
      displayName: item.displayName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      allocatedFromStock,
      quantityToProduce,
    });

    // Record stock allocation movement (negative = stock leaving)
    if (allocatedFromStock > 0) {
      await db.insert(stockMovements).values({
        variantId: item.variantId,
        type: 'allocation',
        quantity: -allocatedFromStock,
        reason: `Order ${reference}`,
        referenceId: order.id,
      });
    }
  }

  // Create notification attempt record
  await db.insert(notificationAttempts).values({
    orderId: order.id,
    provider: 'web3forms',
    status: 'pending',
    attempts: 0,
  });

  // Fire-and-forget notification dispatch
  dispatchNotification(order.id).catch(() => {});

  return c.json({ reference, status: 'new' }, 201);
});

export default checkoutRoutes;
