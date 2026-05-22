import { z } from 'zod';

export const settingSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.string(),
  updatedAt: z.string(),
});

export const settingsUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const shopStatusSchema = z.object({
  shopOpen: z.boolean(),
  currency: z.string().length(3),
  discountTiers: z.array(z.object({
    minItems: z.number().int().positive(),
    percent: z.number().min(0).max(100),
  })),
  contactEmail: z.string().email(),
});
