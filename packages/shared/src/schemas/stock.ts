import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string().min(1),
});

export const movementTypeSchema = z.enum(['adjustment', 'allocation', 'cancellation_restock', 'production']);

export const movementFiltersSchema = z.object({
  variantId: z.string().uuid().optional(),
  type: movementTypeSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const stockMovementSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  type: movementTypeSchema,
  quantity: z.number().int(),
  reason: z.string().nullable(),
  referenceId: z.string().uuid().nullable(),
  createdAt: z.string(),
});
