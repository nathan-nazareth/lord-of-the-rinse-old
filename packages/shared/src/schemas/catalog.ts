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

// --- Attribute reference used in variant create/update ---
export const variantAttributeRefSchema = z.object({
  attributeId: z.string().uuid('Invalid attribute ID'),
  value: z.string().min(1, 'Value is required'),
});

export const variantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  unitPrice: z.string(),
  attributes: z.array(variantAttributeRefSchema),
});

export const variantAdminSchema = variantSchema.extend({
  enabled: z.boolean(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createVariantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with dashes'),
  unitPrice: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal (e.g. 9.99)'),
  attributes: z.array(variantAttributeRefSchema).min(1, 'At least one attribute is required'),
});

export const updateVariantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with dashes').optional(),
  unitPrice: z.string().min(1).regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal').optional(),
  enabled: z.boolean().optional(),
  archived: z.boolean().optional(),
  attributes: z.array(variantAttributeRefSchema).min(1, 'At least one attribute is required').optional(),
});

export const catalogResponseSchema = z.object({
  // The API groups attributes by `type` (shape/scent/color/size/addon) into a
  // map, not a flat array. Keep the schema in lockstep with
  // packages/api/src/routes/catalog.ts:119-123.
  attributes: z.record(attributeTypeSchema, z.array(attributeSchema)),
  variants: z.array(variantSchema),
  settings: z.record(z.string(), z.unknown()),
});
