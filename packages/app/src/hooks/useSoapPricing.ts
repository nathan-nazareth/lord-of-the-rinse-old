import { useMemo } from 'react';
import { LAVENDER_PIECES_PRICE, SOAP_OPTIONS, type SoapScent } from '../../types';
import { calculateDiscount } from '../utils/pricing';

export function useSoapPricing(scent: SoapScent | null, size: number, hasLavenderPieces: boolean) {
  const unitPrice = useMemo(() => {
    if (!scent) return 0;
    const option = SOAP_OPTIONS.find((o) => o.scent === scent);
    const basePrice = option?.price || 0;
    return Math.round(basePrice * (size / 100));
  }, [scent, size]);

  const totalPrice = useMemo(() => {
    let total = unitPrice;
    if (hasLavenderPieces) total += LAVENDER_PIECES_PRICE;
    return total;
  }, [unitPrice, hasLavenderPieces]);

  return { unitPrice, totalPrice };
}

export function useCartTotals(items: { price: number; quantity: number }[], totalQuantity: number) {
  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return calculateDiscount(subtotal, totalQuantity);
  }, [items, totalQuantity]);
}
