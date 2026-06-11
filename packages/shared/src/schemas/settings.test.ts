import { describe, expect, it } from 'vitest';
import {
  settingSchema,
  settingsUpdateSchema,
  shopStatusSchema,
} from './settings';

describe('settingSchema', () => {
  it('accepts valid setting', () => {
    const result = settingSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      key: 'shop_open',
      value: 'true',
      updatedAt: '2026-05-22T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('settingsUpdateSchema', () => {
  it('accepts valid update', () => {
    const result = settingsUpdateSchema.safeParse({
      key: 'shop_open',
      value: 'true',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty key', () => {
    const result = settingsUpdateSchema.safeParse({
      key: '',
      value: 'true',
    });
    expect(result.success).toBe(false);
  });
});

describe('shopStatusSchema', () => {
  it('accepts valid shop status', () => {
    const result = shopStatusSchema.safeParse({
      shop_open: true,
      currency: 'USD',
      discount_tiers: [
        { minItems: 2, percent: 10 },
        { minItems: 4, percent: 15 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid currency code', () => {
    const result = shopStatusSchema.safeParse({
      shop_open: true,
      currency: 'US',
      discount_tiers: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects discount percent over 100', () => {
    const result = shopStatusSchema.safeParse({
      shop_open: true,
      currency: 'USD',
      discount_tiers: [{ minItems: 2, percent: 150 }],
    });
    expect(result.success).toBe(false);
  });
});
