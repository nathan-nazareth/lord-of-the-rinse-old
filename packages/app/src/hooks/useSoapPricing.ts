import { useMemo } from 'react';
import type { CatalogVariant, DiscountTier } from '../types/catalog';
import { calculateDiscount } from '../utils/pricing';

export function useVariantPrice(
  selectedAttributes: Record<string, string | null>,
  variants: CatalogVariant[],
) {
  return useMemo(() => {
    const selectedEntries = Object.entries(selectedAttributes).filter(([, v]) => v !== null);
    if (selectedEntries.length === 0) return { unitPrice: 0, matchedVariant: null };

    const matched = variants.find((v) => {
      if (!v.enabled) return false;
      return selectedEntries.every(([, selectedValue]) =>
        v.attributes.some((a) => a.value === selectedValue),
      );
    });

    if (!matched) return { unitPrice: 0, matchedVariant: null };
    return { unitPrice: Number.parseFloat(matched.unitPrice), matchedVariant: matched };
  }, [selectedAttributes, variants]);
}

export function useCatalogTotals(
  items: { price: number; quantity: number }[],
  totalQuantity: number,
  discountTiers: DiscountTier[],
) {
  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return calculateCatalogDiscount(subtotal, totalQuantity, discountTiers);
  }, [items, totalQuantity, discountTiers]);
}

export function calculateCatalogDiscount(
  subtotal: number,
  totalQuantity: number,
  discountTiers: DiscountTier[],
) {
  const sortedTiers = [...discountTiers].sort((a, b) => b.minItems - a.minItems);
  const applicableTier = sortedTiers.find((t) => totalQuantity >= t.minItems);
  const discountPercentage = applicableTier?.percent ?? 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const total = subtotal - discountAmount;
  return { discountPercentage, discountAmount, total };
}

export function useCartTotals(items: { price: number; quantity: number }[], totalQuantity: number) {
  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return calculateDiscount(subtotal, totalQuantity);
  }, [items, totalQuantity]);
}

export function useSoapPricing(
  _scent: string,
  _size: number,
  _hasLavenderPieces: boolean,
) {
  return useMemo(() => ({ totalPrice: 0 }), []);
}
