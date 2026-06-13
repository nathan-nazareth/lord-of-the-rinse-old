import type { CartItem } from '../types/cart';
import type { DiscountTier } from '../types/catalog';
import type { Customer, WebhookLogEntry, WebhookStatus } from '../types/webhook';
import {
  logWeb3FormsError,
  logWeb3FormsRateLimit,
  logWeb3FormsSuccess,
} from '../utils/errorLogging';
import { calculateDiscount } from '../utils/pricing';

const WEBHOOK_PROXY_PATH = '/api/webhook-submit';
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;

function generateOrderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    let onAbort: (() => void) | null = null;
    const cleanup = () => {
      if (onAbort && signal) {
        signal.removeEventListener('abort', onAbort);
        onAbort = null;
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    onAbort = () => {
      clearTimeout(timer);
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    // Without an explicit removeEventListener after the timer fires, each
    // call to sleep() against a long-lived `signal` (the checkout's
    // AbortController is reused across retry attempts) would attach a
    // fresh listener that never gets cleaned up. { once: true } only
    // removes the listener on abort — not on resolve.
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function getRetryDelay(attempt: number): number {
  return 2 ** (attempt - 1) * 1000;
}

interface Web3FormsResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id?: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export async function submitCartToWebhook(
  customer: Customer,
  items: CartItem[],
  onStatusChange?: (status: WebhookStatus) => void,
  onLog?: (log: WebhookLogEntry) => void,
  options: { signal?: AbortSignal } = {},
  discountTiers?: DiscountTier[],
): Promise<{ success: boolean; orderId: string }> {
  const orderId = generateOrderId();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const {
    discountPercentage,
    discountAmount,
    total: finalTotal,
  } = calculateDiscount(subtotal, totalQuantity, discountTiers);

  const orderItemsFormatted = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.shape || 'N/A'} | ${item.scent}${item.hasLavenderPieces ? ' (+lavender pieces)' : ''} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity} | ₹${item.price * item.quantity}`,
    )
    .join('\n');

  const allShapes = items.map((item) => item.shape || 'N/A').join(', ');

  // Sanitize free-form strings to defang CRLF injection and limit length
  // before they end up in email headers / body via Web3Forms.
  const sanitize = (s: string, max = 200): string =>
    String(s ?? '')
      .replace(/[\r\n\t\0\v\f]/g, ' ')
      .slice(0, max);

  const safeName = sanitize(customer.name, 100);
  const safeEmail = sanitize(customer.email, 200);
  const safePhone = sanitize(customer.phone ?? '', 50);

  // Format prices as fixed-decimal strings so very large subtotals don't
  // // bleed into scientific notation when they hit the email body.
  const fmtMoney = (n: number): string => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

  const web3FormsPayload: Record<string, string | number | undefined> = {
    Name: safeName,
    Email: safeEmail,
    'Phone number': safePhone,
    'Soap Shape': sanitize(allShapes, 500),
    'Order Details': sanitize(orderItemsFormatted, 4000),
    'Total items': totalQuantity,
    Subtotal: `₹${fmtMoney(subtotal)}`,
    Discount: `${discountPercentage}% (₹${fmtMoney(discountAmount)})`,
    'Final Total': `₹${fmtMoney(finalTotal)}`,
    order_id: orderId,
    submission_timestamp: new Date().toISOString(),
    from_name: safeName,
    subject: `New Soap Order from ${safeName}`,
  };

  console.log('[Webhook] Submitting order via server proxy');

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    if (onStatusChange) {
      onStatusChange('submitting');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    // Cascade external abort into our internal controller.
    const onExternalAbort = () => controller.abort();
    if (options.signal) {
      if (options.signal.aborted) controller.abort();
      else options.signal.addEventListener('abort', onExternalAbort, { once: true });
    }

    try {
      const response = await fetch(WEBHOOK_PROXY_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(web3FormsPayload),
        signal: controller.signal,
      });

      let responseData: Web3FormsResponse;
      try {
        responseData = (await response.json()) as Web3FormsResponse;
      } catch (jsonErr) {
        // Non-JSON responses (HTML error pages, Cloudflare blocks, etc.) must
        // NOT be reported as a success-style retry. Mark this attempt as a
        // transport error and stop retrying for the same response shape.
        logWeb3FormsError(
          orderId,
          'network_error',
          `Non-JSON response (HTTP ${response.status})`,
          attempt,
        );
        if (onLog) {
          onLog({
            orderId,
            status: response.status,
            timestamp: new Date().toISOString(),
            attempt,
            success: false,
            error: jsonErr instanceof Error ? jsonErr.message : 'non-JSON response',
          });
        }
        lastError = new Error(`Non-JSON response (HTTP ${response.status})`);
        // Network-shape failure: retry with backoff instead of bailing.
        if (attempt < MAX_RETRIES) {
          await sleep(getRetryDelay(attempt), options.signal);
        }
        continue;
      }

      const logEntry: WebhookLogEntry = {
        orderId,
        status: response.status,
        timestamp: new Date().toISOString(),
        attempt,
        success: responseData.success,
      };

      if (onLog) {
        onLog(logEntry);
      }

      if (responseData.success) {
        logWeb3FormsSuccess(orderId);

        if (onStatusChange) {
          onStatusChange('submitted');
        }

        return { success: true, orderId };
      }

      if (response.status === 429) {
        logWeb3FormsRateLimit(orderId, attempt, MAX_RETRIES);
        if (attempt < MAX_RETRIES) {
          await sleep(getRetryDelay(attempt), options.signal);
          continue;
        }
      } else if (response.status === 401) {
        // 401 means our access key is misconfigured — retrying won't help
        // and would only burn the rate-limit budget.
        logWeb3FormsError(orderId, 'unauthorized', 'Invalid Web3Forms access key', attempt);
        lastError = new Error('Invalid Web3Forms access key');
        break;
      } else if (response.status === 400) {
        // 400 means the request was malformed; retrying with the same body
        // is guaranteed to fail. Break out so the user gets immediate
        // feedback instead of waiting through 3 attempts × 10s timeout.
        logWeb3FormsError(
          orderId,
          'validation',
          responseData.message || 'Validation failed',
          attempt,
        );
        lastError = new Error(responseData.message || 'Validation failed');
        break;
      } else if (response.status >= 500) {
        logWeb3FormsError(orderId, 'server_error', responseData.message || 'Server error', attempt);
      } else {
        logWeb3FormsError(orderId, 'network_error', `HTTP ${response.status}`, attempt);
      }

      lastError = new Error(responseData.message || `Webhook returned status ${response.status}`);
    } catch (error) {
      const err = error as Error & { name?: string };
      lastError = err instanceof Error ? err : new Error('Unknown error');
      logWeb3FormsError(orderId, 'network_error', lastError.message, attempt);

      if (onLog) {
        onLog({
          orderId,
          status: null,
          timestamp: new Date().toISOString(),
          attempt,
          success: false,
          error: lastError.message,
        });
      }

      // Distinguish: an EXTERNAL abort (the caller cancelled the checkout)
      // must short-circuit. An INTERNAL abort (our 10s timeout) is a transient
      // failure and should be retried.
      const externalAbort = err.name === 'AbortError' && options.signal?.aborted;
      if (externalAbort) {
        if (onStatusChange) onStatusChange('failed');
        return { success: false, orderId };
      }

      if (attempt < MAX_RETRIES) {
        await sleep(getRetryDelay(attempt), options.signal);
      }
    } finally {
      clearTimeout(timeoutId);
      if (options.signal) options.signal.removeEventListener('abort', onExternalAbort);
    }
  }

  if (onStatusChange) {
    onStatusChange('failed');
  }

  console.error(
    `[Webhook] Order ${orderId} failed after ${MAX_RETRIES} attempts:`,
    lastError?.message,
  );

  return { success: false, orderId };
}
