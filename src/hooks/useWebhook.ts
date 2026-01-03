import { useState, useCallback } from 'react';
import { WebhookStatus, WebhookLogEntry } from '../types/webhook';
import { submitOrderToWebhook } from '../services/webhook';

interface UseWebhookReturn {
  webhookStatus: WebhookStatus;
  submitOrder: (
    scent: string | null,
    customScent: string,
    color: string | null,
    quantity: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string
  ) => Promise<{ success: boolean; orderId: string }>;
  resetStatus: () => void;
  lastLog: WebhookLogEntry | null;
}

export function useWebhook(): UseWebhookReturn {
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus>('idle');
  const [lastLog, setLastLog] = useState<WebhookLogEntry | null>(null);

  const handleLog = useCallback((log: WebhookLogEntry) => {
    setLastLog(log);
    console.log('[Webhook] Order submitted:', {
      orderId: log.orderId,
      status: log.status,
      timestamp: log.timestamp,
      attempt: log.attempt,
    });
  }, []);

  const submitOrder = useCallback(
    async (
      scent: string | null,
      customScent: string,
      color: string | null,
      quantity: string,
      customerName: string,
      customerEmail: string,
      customerPhone: string
    ): Promise<{ success: boolean; orderId: string }> => {
      setWebhookStatus('pending');
      
      return submitOrderToWebhook(
        scent,
        customScent,
        color,
        quantity,
        customerName,
        customerEmail,
        customerPhone,
        setWebhookStatus,
        handleLog
      );
    },
    [handleLog]
  );

  const resetStatus = useCallback(() => {
    setWebhookStatus('idle');
    setLastLog(null);
  }, []);

  return {
    webhookStatus,
    submitOrder,
    resetStatus,
    lastLog,
  };
}
