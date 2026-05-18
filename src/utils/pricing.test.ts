import { describe, it, expect } from 'vitest';
import { calculateDiscount } from '@/src/utils/pricing';

describe('calculateDiscount', () => {
  it('returns 0% discount for 0 items', () => {
    const result = calculateDiscount(100, 0);
    expect(result).toEqual({ discountPercentage: 0, discountAmount: 0, total: 100 });
  });

  it('returns 0% discount for 1 item', () => {
    const result = calculateDiscount(100, 1);
    expect(result).toEqual({ discountPercentage: 0, discountAmount: 0, total: 100 });
  });

  it('returns 10% discount for 2 items', () => {
    const result = calculateDiscount(100, 2);
    expect(result).toEqual({ discountPercentage: 10, discountAmount: 10, total: 90 });
  });

  it('returns 15% discount for 4 items', () => {
    const result = calculateDiscount(100, 4);
    expect(result).toEqual({ discountPercentage: 15, discountAmount: 15, total: 85 });
  });
});
