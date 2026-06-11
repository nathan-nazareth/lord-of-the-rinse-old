import { useMemo } from 'react';
import type { CatalogAttribute, CatalogVariant, DiscountTier } from '../types/catalog';
import { calculateDiscount, getDiscountPercentage } from '../utils/pricing';
import { LAVENDER_PIECES_PRICE, SOAP_OPTIONS } from '../../types';

const SIZE_PRICE_PER_GRAM = 0.6;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export function useVariantPrice(
  selectedAttributes: Record<string, string | null>,
  variants: CatalogVariant[],
  catalogAttributes: Record<string, CatalogAttribute[]> = {},
) {
  return useMemo(() => {
    const selectedEntries = Object.entries(selectedAttributes).filter(([, v]) => v !== null);
    if (selectedEntries.length === 0) return { unitPrice: 0, matchedVariant: null };

    // Build a per-type index of (value -> set of attribute IDs). We use
    // both the attribute slug and the human-readable name because the
    // form stores the human-readable name as the selected value, while
    // the catalog may canonicalize on slug.
    const valueToAttrIdsByType: Record<string, Map<string, Set<string>>> = {};
    for (const [type, attrs] of Object.entries(catalogAttributes)) {
      const byValue = new Map<string, Set<string>>();
      for (const attr of attrs) {
        for (const v of [attr.slug, attr.name]) {
          let ids = byValue.get(v);
          if (!ids) {
            ids = new Set<string>();
            byValue.set(v, ids);
          }
          ids.add(attr.id);
        }
      }
      valueToAttrIdsByType[type] = byValue;
    }

    const matched = variants.find((v) => {
      if (!v.enabled) return false;
      // The variant must carry at least one attribute value that maps
      // back, via the catalog, to each selected (type, value) pair.
      // We track consumed variant-attribute IDs so the same attribute
      // slot can't satisfy two different selected types.
      const consumed = new Set<string>();
      for (const [type, selectedValue] of selectedEntries) {
        if (selectedValue === null) continue;
        const byValue = valueToAttrIdsByType[type];
        if (!byValue) {
          // No catalog data for this type — fall back to value-only match.
          const attr = v.attributes.find(
            (a) => a.value === selectedValue && !consumed.has(a.attributeId),
          );
          if (!attr) return false;
          consumed.add(attr.attributeId);
          continue;
        }
        const matchingAttrIds = byValue.get(selectedValue);
        if (!matchingAttrIds || matchingAttrIds.size === 0) return false;
        const attr = v.attributes.find(
          (a) => matchingAttrIds.has(a.attributeId) && !consumed.has(a.attributeId),
        );
        if (!attr) return false;
        consumed.add(attr.attributeId);
      }
      return true;
    });

    if (!matched) return { unitPrice: 0, matchedVariant: null };
    const unitPrice = Number.parseFloat(matched.unitPrice);
    return {
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      matchedVariant: matched,
    };
  }, [selectedAttributes, variants, catalogAttributes]);
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
