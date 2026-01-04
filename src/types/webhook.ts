export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  scent: string;
  color: string;
  quantity: number;
}

export interface WebhookPayload {
  customer: Customer;
  items: OrderItem[];
}

export type WebhookStatus = 'idle' | 'pending' | 'submitting' | 'submitted' | 'failed';

export interface WebhookLogEntry {
  orderId: string;
  status: number | null;
  timestamp: string;
  attempt: number;
  success: boolean;
  error?: string;
}
