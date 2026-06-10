/// <reference types="vite/client" />

import type { CartItem } from '../types/cart';
import type { Customer, WebhookLogEntry, WebhookStatus } from '../types/webhook';
import {
  logWeb3FormsError,
  logWeb3FormsRateLimit,
  logWeb3FormsSuccess,
} from '../utils/errorLogging';
import { calculateDiscount } from '../utils/pricing';

const WEB3FORMS_ENDPOINT =
  import.meta.env.VITE_WEB3FORMS_ENDPOINT || 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const MIRROR_TIMEOUT_MS = 5000;

function generateOrderId(): string {
  return crypto.randomUUID();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
): Promise<{ success: boolean; orderId: string }> {
  const orderId = generateOrderId();

  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.trim() === '') {
    console.error(
      '[Webhook] ERROR: VITE_WEB3FORMS_ACCESS_KEY is not set. Please add it to your .env file and Vercel environment variables.',
    );
    if (onStatusChange) onStatusChange('failed');
    return { success: false, orderId };
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const {
    discountPercentage,
    discountAmount,
    total: finalTotal,
  } = calculateDiscount(subtotal, totalQuantity);

  const orderItemsFormatted = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.shape || 'N/A'} | ${item.scent}${item.hasLavenderPieces ? ' (+lavender pieces)' : ''} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity} | Rs. ${item.price * item.quantity}`,
    )
    .join('\n');

  const allShapes = items.map((item) => item.shape || 'N/A').join(', ');

  const web3FormsPayload: Record<string, string | number | undefined> = {
    access_key: WEB3FORMS_ACCESS_KEY,
    Name: customer.name,
    Email: customer.email,
    'Phone number': customer.phone || '',
    'Soap Shape': allShapes,
    'Order Details': orderItemsFormatted,
    'Total items': totalQuantity,
    Subtotal: `Rs. ${subtotal}`,
    Discount: `${discountPercentage}% (Rs. ${discountAmount})`,
    'Final Total': `Rs. ${finalTotal}`,
    order_id: orderId,
    submission_timestamp: new Date().toISOString(),
    from_name: customer.name,
    subject: `New Soap Order from ${customer.name}`,
  };

  console.log('[Webhook] Submitting order to Web3Forms');

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
      const response = await fetch(WEB3FORMS_ENDPOINT, {
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
          await sleep(getRetryDelay(attempt));
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

        // Fire-and-forget mirror to the admin API so the shop owner has a
        // record even if the customer-facing checkout API is unavailable.
        // We attach a 5s timeout + signal so a hung server doesn't pin a
        // fetch in the event loop forever.
        const adminPayload = {
          orderId,
          customer,
          items: items.map((i) => ({
            id: i.id,
            variantId: i.variantId,
            shape: i.shape,
            scent: i.scent,
            color: i.color,
            quantity: i.quantity,
            size: i.size,
            price: i.price,
            hasLavenderPieces: i.hasLavenderPieces,
          })),
          totalQuantity,
          subtotal,
          discountPercentage,
          discountAmount,
          finalTotal,
        };

        const mirrorController = new AbortController();
        const mirrorTimeout = setTimeout(() => mirrorController.abort(), MIRROR_TIMEOUT_MS);
        // The admin POST /api/orders endpoint is intentionally removed from
        // the API in this audit. The mirror is now a no-op: the customer
        // checkout API path is the source of truth.
        void mirrorController;
        void adminPayload;
        void mirrorTimeout;

        if (onStatusChange) {
          onStatusChange('submitted');
        }

        return { success: true, orderId };
      }

      if (response.status === 429) {
        logWeb3FormsRateLimit(orderId, attempt, MAX_RETRIES);
        if (attempt < MAX_RETRIES) {
          await sleep(getRetryDelay(attempt));
          continue;
        }
      } else if (response.status === 401) {
        logWeb3FormsError(orderId, 'unauthorized', 'Invalid Web3Forms access key', attempt);
      } else if (response.status === 400) {
        logWeb3FormsError(
          orderId,
          'validation',
          responseData.message || 'Validation failed',
          attempt,
        );
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

      // Respect external abort: don't retry after a cancellation.
      if (err.name === 'AbortError' && options.signal?.aborted) {
        if (onStatusChange) onStatusChange('failed');
        return { success: false, orderId };
      }

      if (attempt < MAX_RETRIES) {
        await sleep(getRetryDelay(attempt));
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
