import { describe, expect, it } from 'vitest';
import {
  stockAdjustmentSchema,
  movementFiltersSchema,
  movementTypeSchema,
} from './stock';

describe('stockAdjustmentSchema', () => {
  it('accepts valid adjustment', () => {
    const result = stockAdjustmentSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 10,
      reason: 'Restock',
    });
    expect(result.success).toBe(true);
  });

  it('accepts negative quantity (stock out)', () => {
    const result = stockAdjustmentSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: -5,
      reason: 'Correction',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty reason', () => {
    const result = stockAdjustmentSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 10,
      reason: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('movementTypeSchema', () => {
  it('accepts valid types', () => {
    for (const type of ['adjustment', 'allocation', 'cancellation_restock', 'production']) {
      expect(movementTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it('rejects invalid type', () => {
    expect(movementTypeSchema.safeParse('unknown').success).toBe(false);
  });
});

describe('movementFiltersSchema', () => {
  it('accepts empty filters', () => {
    expect(movementFiltersSchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial filters', () => {
    expect(movementFiltersSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'allocation',
    }).success).toBe(true);
  });

  it('accepts full filters', () => {
    expect(movementFiltersSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'adjustment',
      from: '2026-01-01T00:00:00Z',
      to: '2026-12-31T23:59:59Z',
    }).success).toBe(true);
  });
});
