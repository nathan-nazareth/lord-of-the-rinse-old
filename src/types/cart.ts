export interface CartItem {
  id: string;
  shape: string;
  scent: string;
  price: number;
  color: string;
  quantity: number;
  size: number;
  hasLavenderPieces: boolean;
  hasRosePieces: boolean;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  updatedAt: string;
}

export interface CartService {
  saveCart(cart: Cart): void;
  loadCart(): Cart | null;
  removeItem(cart: Cart, itemId: string): Cart;
  clearCart(): void;
  calculateTotal(items: CartItem[]): number;
}

export const CART_KEY = "organic-soap-cart";
export const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const MAX_CART_ITEMS = 20;
