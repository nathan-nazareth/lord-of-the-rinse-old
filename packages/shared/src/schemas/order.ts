import { z } from 'zod';

export const orderStatusSchema = z.enum(['new', 'processing', 'fulfilled', 'cancelled']);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const validTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  new: ['processing', 'cancelled'],
  processing: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
};

// Sequence starts at 4 digits (so today's first order is 0001) and grows
// up to 6 digits to handle a busy day without re-introducing the
// slice(-4) collision that corrupted the unique-constraint column.
export const orderReferenceSchema = z.string().regex(/^LOR-\d{8}-\d{4,6}$/);

export const orderSchema = z.object({
  id: z.string().uuid(),
  reference: orderReferenceSchema,
  status: orderStatusSchema,
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().nullable().optional(),
  total: z.string(),
  createdAt: z.string(),
});

export const statusTransitionSchema = z.object({
  status: orderStatusSchema,
});
