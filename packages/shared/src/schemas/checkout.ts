import { z } from 'zod';

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(10000),
  displayName: z.string().min(1),
  unitPrice: z.string().min(1).regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
});

export const checkoutResponseSchema = z.object({
  reference: z.string(),
  status: z.string(),
});
