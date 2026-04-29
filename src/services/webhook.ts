/// <reference types="vite/client" />

import {
  WebhookPayload,
  WebhookLogEntry,
  WebhookStatus,
  Customer
} from '../types/webhook';
import { CartItem } from '../types/cart';
import { logWeb3FormsRateLimit, logWeb3FormsError, logWeb3FormsSuccess } from '../utils/errorLogging';

const WEB3FORMS_ENDPOINT = import.meta.env.VITE_WEB3FORMS_ENDPOINT || 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
const ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL;
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;

function generateOrderId(): string {
  return crypto.randomUUID();
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryDelay(attempt: number): number {
  return Math.pow(2, attempt - 1) * 1000;
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
  onLog?: (log: WebhookLogEntry) => void
): Promise<{ success: boolean; orderId: string }> {
  const orderId = generateOrderId();
  
   // Validate access key
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.trim() === '') {
    console.error('[Webhook] ERROR: VITE_WEB3FORMS_ACCESS_KEY is not set. Please add it to your .env file and Vercel environment variables.');
    if (onStatusChange) onStatusChange('failed');
    return { success: false, orderId };
  }
  
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountPercentage = totalQuantity >= 4 ? 15 : totalQuantity >= 2 ? 10 : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const finalTotal = subtotal - discountAmount;

  const orderItemsFormatted = items.map((item, index) =>
    `${index + 1}. ${item.shape || 'N/A'} | ${item.scent} | Size: ${item.size}g | Color: ${item.color} | Qty: ${item.quantity} | Rs. ${item.price * item.quantity}`
  ).join('\n');

  const allShapes = items.map(item => item.shape || 'N/A').join(', ');

  const web3FormsPayload: Record<string, any> = {
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
    subject: `New Soap Order from ${customer.name}`
  };

   console.log('[Webhook] Submitting order to Web3Forms');

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (onStatusChange) {
      onStatusChange('submitting');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(web3FormsPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData: Web3FormsResponse = await response.json();

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

        if (ADMIN_BACKEND_URL) {
          try {
            await fetch(`${ADMIN_BACKEND_URL}/admin/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-key': '3984'
              },
              body: JSON.stringify({
                order_id: orderId,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone || '',
                items: orderItemsFormatted,
                total_quantity: totalQuantity,
                subtotal,
                discount_percent: discountPercentage,
                discount_amount: discountAmount,
                final_total: finalTotal,
                submitted_at: new Date().toISOString()
              })
            });
          } catch (err) {
            console.error('[Webhook] Failed to save to admin backend:', err);
          }
        }

        return { success: true, orderId };
      }

      if (response.status === 429) {
        logWeb3FormsRateLimit(orderId, attempt, MAX_RETRIES);
        if (attempt < MAX_RETRIES) {
          const delay = getRetryDelay(attempt);
          await sleep(delay);
          continue;
        }
      }

      if (response.status === 401) {
        logWeb3FormsError(orderId, 'unauthorized', 'Invalid Web3Forms access key', attempt);
      } else if (response.status === 400) {
        logWeb3FormsError(orderId, 'validation', responseData.message || 'Validation failed', attempt);
      } else if (response.status >= 500) {
        logWeb3FormsError(orderId, 'server_error', responseData.message || 'Server error', attempt);
      } else {
        logWeb3FormsError(orderId, 'network_error', `HTTP ${response.status}`, attempt);
      }

      lastError = new Error(responseData.message || `Webhook returned status ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      logWeb3FormsError(orderId, 'network_error', lastError.message, attempt);

      const logEntry: WebhookLogEntry = {
        orderId,
        status: null,
        timestamp: new Date().toISOString(),
        attempt,
        success: false,
        error: lastError.message,
      };

      if (onLog) {
        onLog(logEntry);
      }

      if (attempt < MAX_RETRIES) {
        const delay = getRetryDelay(attempt);
        await sleep(delay);
      }
    }
  }

  if (onStatusChange) {
    onStatusChange('failed');
  }

  console.error(`[Webhook] Order ${orderId} failed after ${MAX_RETRIES} attempts:`, lastError?.message);

  return { success: false, orderId };
}
