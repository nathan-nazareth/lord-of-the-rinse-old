import type { CartItem } from '../types/cart';

export function createCartItem(overrides?: Partial<CartItem>): CartItem {
  return {
    id: crypto.randomUUID(),
    variantId: '550e8400-e29b-41d4-a716-446655440000',
    shape: 'rectangle',
    scent: 'unscented',
    price: 8.99,
    color: 'white',
    quantity: 1,
    size: '100g',
    hasLavenderPieces: false,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}
