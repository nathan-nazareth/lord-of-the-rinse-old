import { useState, useCallback } from 'react';
import { WebhookStatus, WebhookLogEntry, SubmissionState, LocalStorageSubmission } from '../types/webhook';
import { submitCartToWebhook } from '../services/webhook';

interface UseWebhookReturn {
  webhookStatus: WebhookStatus;
  submissionState: SubmissionState;
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
  retrySubmission: (orderId: string) => Promise<{ success: boolean; orderId: string }>;
}

const STORAGE_KEY_PREFIX = 'web3forms_state_';

function getStorageKey(orderId: string): string {
  return `${STORAGE_KEY_PREFIX}${orderId}`;
}

function saveToLocalStorage(submission: LocalStorageSubmission): void {
  try {
    localStorage.setItem(getStorageKey(submission.orderId), JSON.stringify(submission));
  } catch (e) {
    console.warn('[useWebhook] Failed to save to localStorage:', e);
  }
}

function loadFromLocalStorage(orderId: string): LocalStorageSubmission | null {
  try {
    const data = localStorage.getItem(getStorageKey(orderId));
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('[useWebhook] Failed to load from localStorage:', e);
    return null;
  }
}

function clearFromLocalStorage(orderId: string): void {
  try {
    localStorage.removeItem(getStorageKey(orderId));
  } catch (e) {
    console.warn('[useWebhook] Failed to clear from localStorage:', e);
  }
}

export function useWebhook(): UseWebhookReturn {
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus>('idle');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('pending');
  const [lastLog, setLastLog] = useState<WebhookLogEntry | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const handleLog = useCallback((log: WebhookLogEntry) => {
    setLastLog(log);
    console.log('[Webhook] Order submitted:', {
      orderId: log.orderId,
      status: log.status,
      timestamp: log.timestamp,
      attempt: log.attempt,
    });
  }, []);

  const saveSubmissionState = useCallback((
    orderId: string,
    state: SubmissionState,
    formData: LocalStorageSubmission['formData'],
    retryCount: number = 0
  ) => {
    const submission: LocalStorageSubmission = {
      orderId,
      submissionState: state,
      timestamp: new Date().toISOString(),
      lastAttempt: new Date().toISOString(),
      retryCount,
      formData,
    };
    saveToLocalStorage(submission);
    setSubmissionState(state);
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
      setSubmissionState('pending');
      
      const customer = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      };

      const items = [{
        id: 'custom-order',
        scent: scent || 'Custom',
        customScent,
        color: color || 'Custom',
        price: 0,
        quantity: parseInt(quantity, 10) || 1,
      }];

      const result = await submitCartToWebhook(
        customer,
        items as any,
        setWebhookStatus,
        handleLog
      );

      if (result.success) {
        setSubmissionState('sent');
        if (currentOrderId) {
          clearFromLocalStorage(currentOrderId);
        }
      } else {
        setSubmissionState('failed');
      }

      if (result.orderId) {
        setCurrentOrderId(result.orderId);
      }

      return result;
    },
    [handleLog, currentOrderId]
  );

  const retrySubmission = useCallback(
    async (orderId: string): Promise<{ success: boolean; orderId: string }> => {
      const savedSubmission = loadFromLocalStorage(orderId);
      
      if (!savedSubmission) {
        console.warn('[useWebhook] No saved submission found for retry');
        return { success: false, orderId };
      }

      setWebhookStatus('pending');
      setSubmissionState('submitting');

      const { formData, retryCount } = savedSubmission;
      const newRetryCount = retryCount + 1;

      const customer = {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
      };

      const items = [{
        id: 'custom-order',
        scent: formData.scent || 'Custom',
        customScent: formData.customScent,
        color: formData.color || 'Custom',
        price: 0,
        quantity: parseInt(formData.quantity, 10) || 1,
      }];

      const result = await submitCartToWebhook(
        customer,
        items as any,
        setWebhookStatus,
        handleLog
      );

      if (result.success) {
        setSubmissionState('sent');
        clearFromLocalStorage(orderId);
      } else {
        setSubmissionState('failed');
        saveSubmissionState(orderId, 'failed', formData, newRetryCount);
      }

      return result;
    },
    [handleLog, saveSubmissionState]
  );

  const resetStatus = useCallback(() => {
    setWebhookStatus('idle');
    setSubmissionState('pending');
    setLastLog(null);
    setCurrentOrderId(null);
  }, []);

  return {
    webhookStatus,
    submissionState,
    submitOrder,
    resetStatus,
    lastLog,
    retrySubmission,
  };
}
