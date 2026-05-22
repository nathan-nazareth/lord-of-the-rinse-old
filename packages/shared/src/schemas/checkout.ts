import { z } from 'zod';

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  displayName: z.string().min(1),
  unitPrice: z.string().min(1),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
});

export const checkoutResponseSchema = z.object({
  orderReference: z.string(),
  total: z.string(),
});
