import type { DiscountTier } from '../types/catalog';

const DEFAULT_TIERS: DiscountTier[] = [
  { minItems: 4, percent: 15 },
  { minItems: 2, percent: 10 },
];

export function getDiscountPercentage(totalQuantity: number, tiers?: DiscountTier[]): number {
  const sorted = [...(tiers ?? DEFAULT_TIERS)].sort((a, b) => b.minItems - a.minItems);
  const applicable = sorted.find((t) => totalQuantity >= t.minItems);
  return applicable?.percent ?? 0;
}

export function calculateDiscount(subtotal: number, totalQuantity: number, tiers?: DiscountTier[]) {
  const discountPercentage = getDiscountPercentage(totalQuantity, tiers);
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const total = subtotal - discountAmount;
  return { discountPercentage, discountAmount, total };
}
