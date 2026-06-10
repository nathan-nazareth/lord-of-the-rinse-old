import { db, sql } from '@lotr/db';
import { notificationAttempts, orderLines, orders, stockMovements } from '@lotr/db/schema';
import { statusTransitionSchema, validTransitions } from '@lotr/shared';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { dispatchNotification } from '../lib/notifications';

const ordersRoutes = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

// List orders with optional status filter
ordersRoutes.get('/', async (c) => {
  const status = c.req.query('status');

  const conditions: SQL[] = [];
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

  const [order] = await db.select().from(orders).where(eq(orders.id, id));

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, id));

  const notifications = await db
    .select()
    .from(notificationAttempts)
    .where(eq(notificationAttempts.orderId, id));

  return c.json({ order, lines, notifications });
});

// Update order status with valid transitions only
ordersRoutes.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  const parsed = statusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const newStatus = parsed.data.status;

  // Run the status update + restock in a single transaction so we never
  // cancel an order without restoring stock (or vice versa).
  try {
    const result = await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, id));

      if (!order) {
        return { notFound: true as const };
      }

      const allowed = validTransitions[order.status as keyof typeof validTransitions];
      if (!allowed?.includes(newStatus)) {
        return {
          invalidTransition: true as const,
          from: order.status,
          to: newStatus,
        };
      }

      const [updated] = await tx
        .update(orders)
        .set({ status: newStatus, updatedAt: sql`now()` })
        .where(eq(orders.id, id))
        .returning();

      if (newStatus === 'cancelled') {
        const lines = await tx.select().from(orderLines).where(eq(orderLines.orderId, id));

        for (const line of lines) {
          if (line.allocatedFromStock > 0 && line.variantId) {
            await tx.insert(stockMovements).values({
              variantId: line.variantId,
              type: 'cancellation_restock',
              quantity: line.allocatedFromStock,
              reason: `Cancellation restock for order ${order.reference}`,
              referenceId: order.id,
            });
          }
        }
      }

      return { order: updated };
    });

    if ('notFound' in result) {
      return c.json({ error: 'Order not found' }, 404);
    }
    if ('invalidTransition' in result) {
      return c.json({ error: `Cannot transition from '${result.from}' to '${result.to}'` }, 400);
    }

    return c.json({ order: result.order });
  } catch (err) {
    console.error('[orders] status update failed:', err);
    return c.json({ error: 'Failed to update order status' }, 500);
  }
});

// Retry notification dispatch for an order
ordersRoutes.post('/:id/retry-notification', async (c) => {
  const id = c.req.param('id');

  // Verify order exists
  const [order] = await db.select().from(orders).where(eq(orders.id, id));

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  // Find the notification attempt
  const [attempt] = await db
    .select()
    .from(notificationAttempts)
    .where(eq(notificationAttempts.orderId, id))
    .limit(1);

  if (!attempt) {
    return c.json({ error: 'No notification attempt found for this order' }, 404);
  }

  // Only allow retry for pending or failed
  if (attempt.status !== 'pending' && attempt.status !== 'failed') {
    return c.json({ error: `Cannot retry notification with status '${attempt.status}'` }, 400);
  }

  // Reset status to pending before dispatch
  await db
    .update(notificationAttempts)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(notificationAttempts.id, attempt.id));

  // Await the dispatch so we can return the result
  await dispatchNotification(id);

  // Fetch updated attempt
  const [updated] = await db
    .select()
    .from(notificationAttempts)
    .where(eq(notificationAttempts.id, attempt.id));

  return c.json({ notification: updated });
});

export default ordersRoutes;
