import { Cart, CartItem, CART_KEY, CART_EXPIRY_MS, MAX_CART_ITEMS } from '../types/cart';

export function saveCart(cart: Cart): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({
      items: cart.items,
      updatedAt: Date.now()
    }));
  } catch (error) {
    console.error('[Cart] Failed to save cart to localStorage:', error);
  }
}

export function loadCart(): Cart | null {
  try {
    const data = localStorage.getItem(CART_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Check expiry
    if (Date.now() - parsed.updatedAt > CART_EXPIRY_MS) {
      localStorage.removeItem(CART_KEY);
      return null;
    }
    
    return {
      items: parsed.items || [],
      totalQuantity: calculateTotal(parsed.items || []),
      updatedAt: new Date(parsed.updatedAt).toISOString()
    };
  } catch (error) {
    console.error('[Cart] Failed to load cart from localStorage:', error);
    return null;
  }
}

export function removeItem(cart: Cart, itemId: string): Cart {
  const filteredItems = cart.items.filter(item => item.id !== itemId);
  return {
    items: filteredItems,
    totalQuantity: calculateTotal(filteredItems),
    updatedAt: new Date().toISOString()
  };
}

export function clearCart(): void {
  try {
    localStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error('[Cart] Failed to clear cart from localStorage:', error);
  }
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function createCartItem(
  scent: string,
  price: number,
  color: string,
  quantity: string
): CartItem {
  return {
    id: crypto.randomUUID(),
    scent,
    price,
    color,
    quantity: parseInt(quantity, 10),
    addedAt: new Date().toISOString()
  };
}

export function canAddToCart(currentItems: CartItem[]): boolean {
  return currentItems.length < MAX_CART_ITEMS;
}

export function getCartItemCount(currentItems: CartItem[]): number {
  return calculateTotal(currentItems);
}
