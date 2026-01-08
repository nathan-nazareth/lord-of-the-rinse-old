export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  scent: string;
  price: number;
  color: string;
  quantity: number;
}

export interface WebhookPayload {
  customer: Customer;
  items: OrderItem[];
  totalQuantity: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
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
