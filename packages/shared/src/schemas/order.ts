import { z } from 'zod';

export const orderStatusSchema = z.enum(['new', 'processing', 'fulfilled', 'cancelled']);

export const validTransitions: Record<string, string[]> = {
  new: ['processing', 'cancelled'],
  processing: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
};

export const orderReferenceSchema = z.string().regex(/^LOR-\d{8}-\d{4}$/);

export const orderSchema = z.object({
  id: z.string().uuid(),
  reference: orderReferenceSchema,
  status: orderStatusSchema,
  customerName: z.string(),
  customerEmail: z.string().email(),
  total: z.string(),
  createdAt: z.string(),
});

export const statusTransitionSchema = z.object({
  status: orderStatusSchema,
});
