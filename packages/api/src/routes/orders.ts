import { db, sql } from '@lotr/db';
import { notificationAttempts, orderLines, orders, stockMovements } from '@lotr/db/schema';
import { statusTransitionSchema, validTransitions } from '@lotr/shared';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { dispatchNotification } from '../lib/notifications';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!UUID_RE.test(id)) return c.json({ error: 'Invalid ID format' }, 400);

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
  if (!UUID_RE.test(id)) return c.json({ error: 'Invalid ID format' }, 400);
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
      // Row-lock the order so two concurrent admin clicks can't both
      // observe status='new' and both decide new→processing (or worse,
      // race new→processing vs new→cancelled). The lock is released
      // when the transaction commits/rolls back.
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .for('update');

      if (!order) {
        return { notFound: true as const };
      }

      const fromStatus = order.status as keyof typeof validTransitions;
      const transitions = validTransitions[fromStatus];
      if (!transitions?.includes(newStatus)) {
        return {
          invalidTransition: true as const,
          from: order.status,
          to: newStatus,
        };
      }

      // Re-validate by appending the new status to the WHERE clause. If a
      // competing transaction already moved the row out of `order.status`
      // between our SELECT FOR UPDATE and UPDATE, the row count will be
      // zero and we surface 409 instead of silently overwriting.
      const [updated] = await tx
        .update(orders)
        .set({ status: newStatus, updatedAt: sql`now()` })
        .where(and(eq(orders.id, id), eq(orders.status, order.status)))
        .returning();

      if (!updated) {
        return {
          concurrentUpdate: true as const,
          expected: order.status,
          to: newStatus,
        };
      }

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
    if ('concurrentUpdate' in result) {
      return c.json(
        { error: 'Order was modified by another request; please retry' },
        409,
      );
    }

    return c.json({ order: result.order });
  } catch (err) {
    console.error('[orders] status update failed:', err);
    // Defer the global error handler so unique-violation / 23505 becomes
    // a 409 instead of a misleading 500.
    throw err;
  }
});

// Retry notification dispatch for an order
ordersRoutes.post('/:id/retry-notification', async (c) => {
  const id = c.req.param('id');
  if (!UUID_RE.test(id)) return c.json({ error: 'Invalid ID format' }, 400);

  try {
    // Validate the attempt inside the same transaction we use to flip its
    // status, so a process kill between the update and the dispatch can't
    // leave the row stuck in 'pending' with an inflated attempts count.
    const result = await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, id));
      if (!order) return { notFound: 'order' as const };

      const [attempt] = await tx
        .select()
        .from(notificationAttempts)
        .where(eq(notificationAttempts.orderId, id))
        .limit(1);
      if (!attempt) return { notFound: 'attempt' as const };

      if (attempt.status !== 'pending' && attempt.status !== 'failed' && attempt.status !== 'skipped') {
        return { invalidStatus: attempt.status as string };
      }

      await tx
        .update(notificationAttempts)
        .set({ status: 'pending', updatedAt: new Date() })
        .where(eq(notificationAttempts.id, attempt.id));

      return { attemptId: attempt.id };
    });

    if ('notFound' in result) {
      // The order itself is the parent resource. An "attempt-not-found" means
      // the order exists but has no notification row — still 404 because the
      // URL resource (an attempt on this order) doesn't exist.
      const message =
        result.notFound === 'order'
          ? 'Order not found'
          : 'No notification attempt found for this order';
      return c.json({ error: message }, 404);
    }
    if ('invalidStatus' in result) {
      return c.json(
        { error: `Cannot retry notification with status '${result.invalidStatus}'` },
        400,
      );
    }

    await dispatchNotification(id);

    const [updated] = await db
      .select()
      .from(notificationAttempts)
      .where(eq(notificationAttempts.id, result.attemptId));

    if (!updated) {
      console.error('[orders] notification attempt vanished for id', result.attemptId);
      return c.json({ error: 'Notification attempt not found after retry' }, 500);
    }

    return c.json({ notification: updated });
  } catch (err) {
    console.error('[orders] retry-notification failed:', err);
    return c.json({ error: 'Failed to retry notification' }, 500);
  }
});

export default ordersRoutes;
