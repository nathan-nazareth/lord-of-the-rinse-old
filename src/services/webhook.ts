/// <reference types="vite/client" />

import {
  WebhookPayload,
  WebhookLogEntry,
  WebhookStatus,
  Customer
} from '../types/webhook';
import { CartItem } from '../types/cart';

const WEBHOOK_URL = import.meta.env.VITE_PABBLY_WEBHOOK_URL;
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

export async function submitCartToWebhook(
  customer: Customer,
  items: CartItem[],
  onStatusChange?: (status: WebhookStatus) => void,
  onLog?: (log: WebhookLogEntry) => void
): Promise<{ success: boolean; orderId: string }> {
  const orderId = generateOrderId();
  
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountPercentage = totalQuantity >= 4 ? 15 : totalQuantity >= 2 ? 10 : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const finalTotal = subtotal - discountAmount;

  const payload: WebhookPayload = {
    customer,
    items: items.map(item => ({
      id: item.id,
      scent: item.scent,
      price: item.price,
      color: item.color,
      quantity: item.quantity
    })),
    totalQuantity,
    subtotal,
    discountPercentage,
    discountAmount,
    finalTotal
  };

  console.log('[Webhook] Submitting order:', JSON.stringify(payload, null, 2));

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (onStatusChange) {
      onStatusChange('submitting');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const logEntry: WebhookLogEntry = {
        orderId,
        status: response.status,
        timestamp: new Date().toISOString(),
        attempt,
        success: response.ok,
      };

      if (onLog) {
        onLog(logEntry);
      }

      if (response.ok) {
        if (onStatusChange) {
          onStatusChange('submitted');
        }
        return { success: true, orderId };
      }

      lastError = new Error(`Webhook returned status ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

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
