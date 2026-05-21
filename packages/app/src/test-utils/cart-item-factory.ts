import type { CartItem } from '../types/cart';

export function createCartItem(overrides?: Partial<CartItem>): CartItem {
  return {
    id: crypto.randomUUID(),
    shape: 'rectangle',
    scent: 'unscented',
    price: 8.99,
    color: 'white',
    quantity: 1,
    size: 100,
    hasLavenderPieces: false,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}
