import { Hono } from 'hono';
import { db, sql } from '@lotr/db';
import { orders, orderLines, stockMovements, notificationAttempts } from '@lotr/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { statusTransitionSchema, validTransitions } from '@lotr/shared';

const ordersRoutes = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

// List orders with optional status filter
ordersRoutes.get('/', async (c) => {
  const status = c.req.query('status');

  const conditions = [];
  if (status) {
    conditions.push(eq(orders.status, status));
  }

  const result = await db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));

  return c.json({ orders: result });
});

// Get single order with lines and notification attempts
ordersRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id));

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  const lines = await db
    .select()
    .from(orderLines)
    .where(eq(orderLines.orderId, id));

  const notifications = await db
    .select()
    .from(notificationAttempts)
    .where(eq(notificationAttempts.orderId, id));

  return c.json({ order, lines, notifications });
});

// Update order status with valid transitions only
ordersRoutes.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = statusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const newStatus = parsed.data.status;

  // Fetch current order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id));

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  // Validate transition
  const allowed = validTransitions[order.status as keyof typeof validTransitions];
  if (!allowed || !allowed.includes(newStatus)) {
    return c.json(
      { error: `Cannot transition from '${order.status}' to '${newStatus}'` },
      400,
    );
  }

  // Update status
  const [updated] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: sql`now()` })
    .where(eq(orders.id, id))
    .returning();

  // On cancellation, create cancellation_restock stock movements for allocated lines
  if (newStatus === 'cancelled') {
    const lines = await db
      .select()
      .from(orderLines)
      .where(eq(orderLines.orderId, id));

    for (const line of lines) {
      if (line.allocatedFromStock > 0 && line.variantId) {
        await db.insert(stockMovements).values({
          variantId: line.variantId,
          type: 'cancellation_restock',
          quantity: line.allocatedFromStock,
          reason: `Cancellation restock for order ${order.reference}`,
          referenceId: order.id,
        });
      }
    }
  }

  return c.json({ order: updated });
});

export default ordersRoutes;
