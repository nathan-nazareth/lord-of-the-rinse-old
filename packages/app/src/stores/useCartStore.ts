import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';
import { CART_EXPIRY_MS, CART_KEY, MAX_CART_ITEMS } from '../types/cart';

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  addItem: (
    variantId: string,
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: string,
  ) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      addItem: (variantId, shape, scent, price, color, quantity, size) => {
        if (get().items.length >= MAX_CART_ITEMS) {
          return false;
        }
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          variantId,
          shape,
          scent,
          price,
          color,
          quantity: parseInt(quantity, 10),
          size,
          addedAt: new Date().toISOString(),
        };
        const newItems = [...get().items, newItem];
        set({
          items: newItems,
          totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });
        return true;
      },
      clearCart: () => {
        set({ items: [], totalQuantity: 0 });
      },
      removeItem: (itemId) => {
        const newItems = get().items.filter((item) => item.id !== itemId);
        set({
          items: newItems,
          totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        const newItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        );
        set({
          items: newItems,
          totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      },
    }),
    {
      name: CART_KEY,
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;

          const parsed = JSON.parse(item);

          if (parsed.state) {
            const state = parsed.state;
            if (state.updatedAt && Date.now() - state.updatedAt > CART_EXPIRY_MS) {
              localStorage.removeItem(name);
              return null;
            }
            return parsed;
          }

          if (parsed.items && parsed.updatedAt) {
            if (Date.now() - parsed.updatedAt > CART_EXPIRY_MS) {
              localStorage.removeItem(name);
              return null;
            }
            return {
              state: {
                items: parsed.items,
                totalQuantity: parsed.items.reduce(
                  (sum: number, item: CartItem) => sum + item.quantity,
                  0,
                ),
              },
              version: 0,
            };
          }

          return null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);

/**
 * Detect and clear legacy cart items (those without variantId).
 * Returns true if legacy items were found and cleared.
 */
export function detectAndClearLegacyCart(): boolean {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    const items: unknown[] = parsed?.state?.items ?? parsed?.items ?? [];
    const hasLegacy = items.some(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        !('variantId' in (item as Record<string, unknown>)),
    );

    if (hasLegacy) {
      localStorage.removeItem(CART_KEY);
      useCartStore.getState().clearCart();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
