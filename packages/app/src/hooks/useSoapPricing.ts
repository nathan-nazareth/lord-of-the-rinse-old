import { useMemo } from 'react';
import type { CatalogVariant, DiscountTier } from '../types/catalog';
import { calculateDiscount, getDiscountPercentage } from '../utils/pricing';
import { LAVENDER_PIECES_PRICE, SOAP_OPTIONS } from '../../types';

const SIZE_PRICE_PER_GRAM = 0.6;

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

export function useSoapPricing(scent: string | null, size: number, hasLavenderPieces: boolean) {
  return useMemo(() => {
    const baseOption = SOAP_OPTIONS.find((o) => o.scent === scent);
    const basePrice = baseOption?.price ?? 100;
    const sizeAdjustment = Math.max(0, size) * SIZE_PRICE_PER_GRAM;
    const addon = hasLavenderPieces ? LAVENDER_PIECES_PRICE : 0;
    const totalPrice = Math.round((basePrice + sizeAdjustment + addon) * 100) / 100;
    return { totalPrice };
  }, [scent, size, hasLavenderPieces]);
}

export { calculateDiscount, getDiscountPercentage };
