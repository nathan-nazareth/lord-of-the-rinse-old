export function getDiscountPercentage(totalQuantity: number): number {
  if (totalQuantity >= 4) return 15;
  if (totalQuantity >= 2) return 10;
  return 0;
}

export function calculateDiscount(subtotal: number, totalQuantity: number) {
  const discountPercentage = getDiscountPercentage(totalQuantity);
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const total = subtotal - discountAmount;
  return { discountPercentage, discountAmount, total };
}
