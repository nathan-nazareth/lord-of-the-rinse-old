import { describe, expect, it } from 'vitest';
import { calculateDiscount, getDiscountPercentage } from './pricing';

describe('getDiscountPercentage', () => {
  it('returns 0 for 0 items', () => {
    expect(getDiscountPercentage(0)).toBe(0);
  });

  it('returns 0 for 1 item', () => {
    expect(getDiscountPercentage(1)).toBe(0);
  });

  it('returns 10 for 2 items', () => {
    expect(getDiscountPercentage(2)).toBe(10);
  });

  it('returns 10 for 3 items', () => {
    expect(getDiscountPercentage(3)).toBe(10);
  });

  it('returns 15 for 4 items', () => {
    expect(getDiscountPercentage(4)).toBe(15);
  });

  it('returns 15 for 10 items', () => {
    expect(getDiscountPercentage(10)).toBe(15);
  });
});

describe('calculateDiscount', () => {
  it('returns 0 discount for a single item', () => {
    const result = calculateDiscount(200, 1);
    expect(result).toEqual({
      discountPercentage: 0,
      discountAmount: 0,
      total: 200,
    });
  });

  it('applies 10% discount for 2 items', () => {
    const result = calculateDiscount(400, 2);
    expect(result).toEqual({
      discountPercentage: 10,
      discountAmount: 40,
      total: 360,
    });
  });

  it('applies 15% discount for 4 items', () => {
    const result = calculateDiscount(800, 4);
    expect(result).toEqual({
      discountPercentage: 15,
      discountAmount: 120,
      total: 680,
    });
  });

  it('rounds discount amount to avoid floating-point cents', () => {
    // 10% of 333 = 33.3 → rounded to 33
    const result = calculateDiscount(333, 2);
    expect(result.discountAmount).toBe(33);
    expect(result.total).toBe(300);
  });

  it('handles 0 subtotal gracefully', () => {
    const result = calculateDiscount(0, 5);
    expect(result).toEqual({
      discountPercentage: 15,
      discountAmount: 0,
      total: 0,
    });
  });
});
