import { db, sql } from '@lotr/db';
import {
  notificationAttempts,
  orderLines,
  orders,
  soapVariants,
  stockMovements,
} from '@lotr/db/schema';
import { checkoutRequestSchema } from '@lotr/shared';
import { desc, eq, inArray, like, sql as drizzleSql } from 'drizzle-orm';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { dispatchNotification } from '../lib/notifications';
import { rateLimit } from '../middleware/rate-limit';

const checkoutRoutes = new Hono();

checkoutRoutes.use('/*', rateLimit({ windowMs: 60_000, max: 10 }));

type TxClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Get current stock level for a variant (sum of all movements).
 * Uses row lock to prevent concurrent over-allocation.
 */
async function getStockLevelTx(tx: TxClient, variantId: string): Promise<number> {
  const [result] = await tx
    .select({
      total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)`,
    })
    .from(stockMovements)
    .where(eq(stockMovements.variantId, variantId));
  return Number(result?.total ?? 0);
}

/**
 * Generate the next order reference for today in format LOR-YYYYMMDD-NNNN.
 * Uses a Postgres advisory lock keyed on the UTC date so concurrent
 * checkouts can't both claim the same sequence number. Must be called
 * inside a transaction so the lock is released atomically.
 */
async function generateOrderReferenceTx(tx: TxClient): Promise<string> {
  // Use UTC for the date so the reference matches the DB's now() value.
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  const prefix = `LOR-${dateStr}-`;
  // 8-digit YYYYMMDD fits safely in a 32-bit signed integer and a Postgres bigint.
  const lockKey = Number.parseInt(dateStr, 10);
  await tx.execute(drizzleSql`SELECT pg_advisory_xact_lock(${lockKey})`);

  const [result] = await tx
    .select({ reference: orders.reference })
    .from(orders)
    .where(like(orders.reference, `${prefix}%`))
    .orderBy(desc(orders.reference))
    .limit(1);

  let nextNum = 1;
  if (result) {
    const currentNum = Number.parseInt(result.reference.slice(-4), 10);
    if (Number.isFinite(currentNum)) {
      nextNum = currentNum + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

async function readJsonBody(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new JsonBodyError();
    }
    throw err;
  }
}

class JsonBodyError extends Error {
  constructor() {
    super('Invalid JSON body');
  }
}

checkoutRoutes.post('/', async (c) => {
  let body: unknown;
  try {
    body = await readJsonBody(c);
  } catch (err) {
    if (err instanceof JsonBodyError) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    throw err;
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { items, customerName, customerEmail, customerPhone } = parsed.data;

  if (customerName.trim().length === 0) {
    return c.json({ error: 'Invalid customer name' }, 400);
  }

  const variantIds = items.map((item) => item.variantId);

  try {
    const result = await db.transaction(async (tx) => {
      const variantRows = await tx
        .select({
          id: soapVariants.id,
          name: soapVariants.name,
          unitPrice: soapVariants.unitPrice,
          enabled: soapVariants.enabled,
          archived: soapVariants.archived,
        })
        .from(soapVariants)
        .where(inArray(soapVariants.id, variantIds))
        .for('update');

      const variantMap = new Map(variantRows.map((v) => [v.id, v]));

      const invalidItems: string[] = [];
      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          invalidItems.push(`Variant ${item.variantId} not found`);
        } else if (!variant.enabled) {
          invalidItems.push(`Variant "${variant.name}" is not available`);
        } else if (variant.archived) {
          invalidItems.push(`Variant "${variant.name}" is no longer available`);
        }
      }
      if (invalidItems.length > 0) {
        return { error: invalidItems } as const;
      }

      let totalCents = 0;
      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) continue;
        const price = Number.parseFloat(variant.unitPrice);
        if (!Number.isFinite(price) || price < 0) {
          return { error: [`Variant "${variant.name}" has an invalid price`] } as const;
        }
        totalCents += Math.round(price * 100) * item.quantity;
      }
      const total = (totalCents / 100).toFixed(2);

      const reference = await generateOrderReferenceTx(tx);

      const [order] = await tx
        .insert(orders)
        .values({
          reference,
          status: 'new',
          customerName,
          customerEmail,
          customerPhone,
          total,
        })
        .returning();

      if (!order) {
        throw new Error('Failed to create order');
      }

      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) continue;

        const currentStock = await getStockLevelTx(tx, item.variantId);
        const allocatedFromStock = Math.min(currentStock, item.quantity);
        const quantityToProduce = item.quantity - allocatedFromStock;

        await tx.insert(orderLines).values({
          orderId: order.id,
          variantId: item.variantId,
          displayName: variant.name,
          quantity: item.quantity,
          unitPrice: variant.unitPrice,
          allocatedFromStock,
          quantityToProduce,
        });

        if (allocatedFromStock > 0) {
          await tx.insert(stockMovements).values({
            variantId: item.variantId,
            type: 'allocation',
            quantity: -allocatedFromStock,
            reason: `Order ${reference}`,
            referenceId: order.id,
          });
        }
      }

      await tx.insert(notificationAttempts).values({
        orderId: order.id,
        provider: 'web3forms',
        status: 'pending',
        attempts: 0,
      });

      return { order, reference };
    });

    if ('error' in result) {
      return c.json({ error: 'Invalid items in cart', details: result.error }, 400);
    }

    dispatchNotification(result.order.id).catch((err) => {
      console.error('[checkout] dispatchNotification failed:', err);
    });

    return c.json({ reference: result.reference, status: 'new' }, 201);
  } catch (err) {
    console.error('[checkout] transaction failed:', err);
    return c.json({ error: 'Failed to place order' }, 500);
  }
});

export default checkoutRoutes;
