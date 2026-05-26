import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';
import { CART_EXPIRY_MS, CART_KEY, MAX_CART_ITEMS } from '../types/cart';

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  addItem: (
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

function computeTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const q = Number(item.quantity);
    return sum + (Number.isFinite(q) && q > 0 ? q : 0);
  }, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,

      addItem: (shape, scent, price, color, quantity, size) => {
        if (get().items.length >= MAX_CART_ITEMS) {
          return false;
        }
        const q = parseInt(quantity, 10);
        const cleanPrice = Number.isFinite(price) && price >= 0 ? price : 0;
        const variantId = `${shape}-${scent}-${color}-${size}`.toLowerCase().replace(/\s+/g, '-');
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          variantId,
          shape,
          scent,
          price: cleanPrice,
          color,
          quantity: Number.isFinite(q) && q > 0 ? q : 1,
          size: typeof size === 'string' && size.length > 0 ? size : '100',
          addedAt: new Date().toISOString(),
        };
        const newItems = [...get().items, newItem];
        set({
          items: newItems,
          totalQuantity: computeTotalQuantity(newItems),
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
          totalQuantity: computeTotalQuantity(newItems),
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
          totalQuantity: computeTotalQuantity(newItems),
        });
      },
    }),
    {
      name: CART_KEY,
      storage: {
        getItem: (name) => {
          try {
            const item = localStorage.getItem(name);
            if (!item) return null;

            const parsed = JSON.parse(item);
            const stateOrItems = parsed?.state ?? parsed;

            if (!stateOrItems) return null;

            const rawItems: unknown = stateOrItems.items;
            if (!Array.isArray(rawItems)) return null;

            if (stateOrItems.updatedAt) {
              if (Date.now() - stateOrItems.updatedAt > CART_EXPIRY_MS) {
                localStorage.removeItem(name);
                return null;
              }
            }

            const cleanItems: CartItem[] = rawItems
              .filter((raw): raw is Record<string, unknown> =>
                typeof raw === 'object' && raw !== null,
              )
              .map((raw) => {
                const q = parseInt(String(raw.quantity), 10);
                const p = parseFloat(String(raw.price));

                return {
                  id: typeof raw.id === 'string' ? raw.id : crypto.randomUUID(),
                  variantId:
                    typeof raw.variantId === 'string' ? raw.variantId : 'unknown',
                  shape: typeof raw.shape === 'string' ? raw.shape : 'Unknown',
                  scent: typeof raw.scent === 'string' ? raw.scent : 'Unknown',
                  price: Number.isFinite(p) && p >= 0 ? p : 0,
                  color: typeof raw.color === 'string' ? raw.color : 'Unknown',
                  quantity: Number.isFinite(q) && q > 0 ? q : 1,
                  size: typeof raw.size === 'string' && raw.size.length > 0 ? raw.size : '100',
                  addedAt:
                    typeof raw.addedAt === 'string' ? raw.addedAt : new Date().toISOString(),
                };
              });

            const totalQuantity = computeTotalQuantity(cleanItems);

            return {
              state: { items: cleanItems, totalQuantity },
              version: 0,
            };
          } catch {
            return null;
          }
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
        (!('variantId' in (item as Record<string, unknown>)) ||
          !('size' in (item as Record<string, unknown>)) ||
          typeof (item as Record<string, unknown>).size !== 'string'),
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
