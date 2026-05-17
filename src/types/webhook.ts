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

export type WebhookStatus = "idle" | "pending" | "submitting" | "submitted" | "failed";

export interface WebhookLogEntry {
  orderId: string;
  status: number | null;
  timestamp: string;
  attempt: number;
  success: boolean;
  error?: string;
}

export type SubmissionState = "pending" | "submitting" | "sent" | "failed";

export interface LocalStorageSubmission {
  orderId: string;
  submissionState: SubmissionState;
  timestamp: string;
  lastAttempt: string | null;
  retryCount: number;
  formData: {
    scent: string | null;
    customScent: string;
    color: string | null;
    quantity: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
}
