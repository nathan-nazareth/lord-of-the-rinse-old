import { z } from 'zod';

export const attributeTypeSchema = z.enum(['shape', 'scent', 'color', 'size', 'addon']);

export const attributeSchema = z.object({
  id: z.string().uuid(),
  type: attributeTypeSchema,
  name: z.string(),
  slug: z.string(),
  displayOrder: z.number(),
});

export const attributeAdminSchema = attributeSchema.extend({
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createAttributeSchema = z.object({
  type: attributeTypeSchema,
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with dashes'),
  displayOrder: z.number().int().default(0),
});

export const updateAttributeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with dashes').optional(),
  displayOrder: z.number().int().optional(),
  archived: z.boolean().optional(),
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
