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

// Re-define (instead of importing from settings) so the checkout bundle
// has a self-contained definition that can be reused by both the API
// and the app for runtime validation. minItems must be ≥ 1 (otherwise
// every order qualifies) and percent must be within [0, 100] so a
// hand-crafted admin setting can't drive the order total negative.
export const discountTierSchema = z.object({
  minItems: z.number().int().positive(),
  percent: z.number().min(0).max(100),
});

export const discountTiersSchema = z.array(discountTierSchema);
