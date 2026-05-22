import { z } from 'zod';

export const attributeTypeSchema = z.enum(['shape', 'scent', 'color', 'size', 'addon']);

export const attributeSchema = z.object({
  id: z.string().uuid(),
  type: attributeTypeSchema,
  name: z.string(),
  slug: z.string(),
  displayOrder: z.number(),
});

export const variantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  unitPrice: z.string(),
  attributes: z.array(z.object({
    attributeId: z.string().uuid(),
    value: z.string(),
  })),
});

export const catalogResponseSchema = z.object({
  attributes: z.array(attributeSchema),
  variants: z.array(variantSchema),
  settings: z.record(z.string(), z.unknown()),
});
