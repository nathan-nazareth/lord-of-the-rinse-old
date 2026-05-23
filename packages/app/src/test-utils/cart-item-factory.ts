import type { CartItem } from '../types/cart';

export function createCartItem(overrides?: Partial<CartItem>): CartItem {
  return {
    id: crypto.randomUUID(),
    variantId: 'variant-1',
    shape: 'rectangle',
    scent: 'unscented',
    price: 8.99,
    color: 'white',
    quantity: 1,
    size: '100g',
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}
