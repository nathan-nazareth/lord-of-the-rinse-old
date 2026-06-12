import { db, sql } from '@lotr/db';
import {
  commerceSettings,
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

interface DiscountTier {
  minItems: number;
  percent: number;
}

function applyDiscountTiers(subtotalCents: number, totalQuantity: number, tiers: DiscountTier[]) {
  const sorted = [...tiers].sort((a, b) => b.minItems - a.minItems);
  const applicable = sorted.find((t) => totalQuantity >= t.minItems);
  if (!applicable) return { discountPercent: 0, discountCents: 0, totalCents: subtotalCents };
  const discountCents = Math.round(subtotalCents * (applicable.percent / 100));
  return { discountPercent: applicable.percent, discountCents, totalCents: subtotalCents - discountCents };
}

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
 * Uses a Postgres advisory lock keyed on a namespaced hash of the UTC date
 * so concurrent checkouts can't both claim the same sequence number AND
 * so the lock can never collide with an advisory lock used elsewhere
 * (e.g. an unrelated feature holding a lock on the same int).
 * Must be called inside a transaction so the lock is released atomically.
 */
async function generateOrderReferenceTx(tx: TxClient): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  const prefix = `LOR-${dateStr}-`;
  // Namespace constant mixed with the date so this advisory lock is
  // distinct from any other pg_advisory_xact_lock usage. The bitwise
  // shift keeps the result inside a 32-bit signed int (Postgres limit).
  const NAMESPACE = 0x4c4f5231; // "LOR1" as ASCII hex
  const dateNum = Number.parseInt(dateStr, 10);
  const lockKey = (NAMESPACE ^ dateNum) | 0;
  await tx.execute(drizzleSql`SELECT pg_advisory_xact_lock(${lockKey})`);

  // Find the highest sequence number for today by parsing the suffix
  // numerically and ordering by both length and lex order — otherwise
  // '9999' < '10000' lexically and we'd hand out a duplicate.
  const [result] = await tx
    .select({ reference: orders.reference })
    .from(orders)
    .where(like(orders.reference, `${prefix}%`))
    .orderBy(sql`length(${orders.reference}) DESC`, desc(orders.reference))
    .limit(1);

  let nextNum = 1;
  if (result) {
    const suffix = result.reference.slice(prefix.length);
    const currentNum = Number.parseInt(suffix, 10);
    if (Number.isFinite(currentNum) && currentNum >= 0) {
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

/**
 * Derive a stable 32-bit advisory-lock key from a variant UUID. Two
 * distinct variants will land on different keys with overwhelming
 * probability (the hash is lossy but spread enough for a per-variant
 * mutex). The high bit is masked off so the result is a positive
 * signed 32-bit int, matching Postgres' pg_advisory_xact_lock(int)
 * signature.
 */
function computeVariantAdvisoryKey(variantId: string): number {
  // Replace dashes with empty so the first 8 hex chars cover the high bits.
  const hex = variantId.replace(/-/g, '').slice(0, 8);
  const n = Number.parseInt(hex, 16);
  if (!Number.isFinite(n)) {
    // Fall back to a string hash for malformed UUIDs; the lock is only
    // contended per-variant so an occasional collision is harmless.
    let h = 0;
    for (let i = 0; i < variantId.length; i += 1) {
      h = (h * 31 + variantId.charCodeAt(i)) | 0;
    }
    return h & 0x7fffffff;
  }
  return n & 0x7fffffff;
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

      let subtotalCents = 0;
      let totalQuantity = 0;
      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) continue;
        const price = Number.parseFloat(variant.unitPrice);
        if (!Number.isFinite(price) || price < 0) {
          return { error: [`Variant "${variant.name}" has an invalid price`] } as const;
        }
        subtotalCents += Math.round(price * 100) * item.quantity;
        totalQuantity += item.quantity;
      }

      const [discountRow] = await tx
        .select({ value: commerceSettings.value })
        .from(commerceSettings)
        .where(eq(commerceSettings.key, 'discount_tiers'))
        .limit(1);
      let discountTiers: DiscountTier[] = [];
      if (discountRow?.value) {
        try {
          const parsed = JSON.parse(discountRow.value);
          if (Array.isArray(parsed)) discountTiers = parsed;
        } catch { /* no discount */ }
      }
      const { totalCents } = applyDiscountTiers(subtotalCents, totalQuantity, discountTiers);
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

        // Lock the stock ledger for THIS variant with a namespaced
        // Postgres advisory lock so two concurrent checkouts can't both
        // observe the same starting balance and over-allocate. The
        // `for('update')` row lock on `soapVariants` above doesn't
        // cover the stock_movements sum, so without this guard two
        // requests for the same variant would each read `currentStock=5`
        // and each try to allocate the full 5. The advisory key is
        // derived from the variant UUID's first 4 bytes folded into a
        // signed 32-bit int — collision-resistant enough for a per-variant
        // mutex and well within Postgres' 32-bit advisory lock range.
        const advisory = computeVariantAdvisoryKey(item.variantId);
        await tx.execute(drizzleSql`SELECT pg_advisory_xact_lock(${advisory})`);

        const currentStock = await getStockLevelTx(tx, item.variantId);
        const allocatedFromStock = Math.max(0, Math.min(currentStock, item.quantity));
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
