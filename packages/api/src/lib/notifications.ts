import { db, sql } from '@lotr/db';
import { commerceSettings, notificationAttempts, orderLines, orders } from '@lotr/db/schema';
import { eq } from 'drizzle-orm';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  LKR: 'Rs. ',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

function resolveCurrencySymbol(isoCode: string | null | undefined): string {
  if (!isoCode) return '$';
  return CURRENCY_SYMBOLS[isoCode.toUpperCase()] ?? `${isoCode} `;
}

/**
 * Check if Web3Forms notifications are enabled via commerceSettings.
 * Defaults to true if the setting is absent or not explicitly "false".
 */
async function isWeb3FormsEnabled(): Promise<boolean> {
  const [row] = await db
    .select()
    .from(commerceSettings)
    .where(eq(commerceSettings.key, 'web3forms_enabled'))
    .limit(1);

  if (!row) return true;
  return row.value !== 'false';
}

async function getCurrencySymbol(): Promise<string> {
  const [row] = await db
    .select()
    .from(commerceSettings)
    .where(eq(commerceSettings.key, 'currency'))
    .limit(1);
  if (!row) return '$';
  try {
    const parsed: unknown = JSON.parse(row.value);
    if (typeof parsed === 'string') return resolveCurrencySymbol(parsed);
  } catch {
    return resolveCurrencySymbol(row.value);
  }
  return '$';
}

/**
 * Build the email payload from order data for Web3Forms submission.
 */
async function buildWeb3FormsPayload(
  order: { reference: string; customerName: string; customerEmail: string; total: string },
  lines: { displayName: string; quantity: number; unitPrice: string }[],
): Promise<Record<string, string>> {
  const fmtPrice = (raw: string): string => {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  };
  const symbol = await getCurrencySymbol();
  const itemsList = lines
    .map((l) => `- ${l.displayName} x${l.quantity} @ ${symbol}${fmtPrice(l.unitPrice)}`)
    .join('\n');

  const message = [
    `New order: ${order.reference}`,
    '',
    `Customer: ${order.customerName} (${order.customerEmail})`,
    `Total: ${symbol}${fmtPrice(order.total)}`,
    '',
    'Items:',
    itemsList,
  ].join('\n');

  return {
    subject: `New Order: ${order.reference}`,
    from_name: order.customerName,
    replyto: order.customerEmail,
    message,
  };
}

/**
 * Dispatch a Web3Forms notification for the given order.
 *
 * - Fetches order + lines from DB
 * - Checks web3forms_enabled setting
 * - Posts to Web3Forms API
 * - Updates notificationAttempt status, attempts count, and lastError
 *
 * Designed to be called fire-and-forget after checkout.
 */
export async function dispatchNotification(orderId: string): Promise<void> {
  // Check enabled setting
  const enabled = await isWeb3FormsEnabled();
  if (!enabled) {
    return;
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error(
      '[dispatchNotification] WEB3FORMS_ACCESS_KEY is not set; skipping notification for order',
      orderId,
    );
    return;
  }

  // Fetch order
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

  if (!order) return;

  // Fetch lines
  const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, orderId));

  // Fetch pending notification attempt for this order
  const [attempt] = await db
    .select()
    .from(notificationAttempts)
    .where(eq(notificationAttempts.orderId, orderId))
    .limit(1);

  if (!attempt) return;

  // Build and send
  const payload = { ...(await buildWeb3FormsPayload(order, lines)), access_key: accessKey };

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      throw new Error(`Web3Forms ${response.status}: ${text}`);
    }

    // Success
    await db
      .update(notificationAttempts)
      .set({
        status: 'sent',
        attempts: sql`${notificationAttempts.attempts} + 1`,
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(notificationAttempts.id, attempt.id));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[dispatchNotification] failed:', errorMessage);
    try {
      await db
        .update(notificationAttempts)
        .set({
          status: 'failed',
          attempts: sql`${notificationAttempts.attempts} + 1`,
          lastError: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(notificationAttempts.id, attempt.id));
    } catch (updateErr) {
      console.error(
        '[dispatchNotification] could not record failure status:',
        updateErr instanceof Error ? updateErr.message : String(updateErr),
      );
    }
  }
}
