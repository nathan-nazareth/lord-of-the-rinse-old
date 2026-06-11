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

// Mirrors the public portion of the catalog response shape (see
// packages/api/src/routes/catalog.ts and `PUBLIC_SETTINGS`).
// Uses snake_case to match the keys the API actually returns — the
// previous camelCase version was dead code that would have failed
// validation against the real wire format.
export const shopStatusSchema = z.object({
  shop_open: z.boolean(),
  currency: z.string().length(3),
  discount_tiers: z.array(z.object({
    minItems: z.number().int().positive(),
    percent: z.number().min(0).max(100),
  })),
});
