import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';
import { CART_EXPIRY_MS, CART_KEY, MAX_CART_ITEMS } from '../types/cart';
import { isUuid } from '../hooks/useSoapPricing';

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
    hasLavenderPieces: boolean,
    variantId?: string,
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

function safeUuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  // Last-resort RFC4122-ish v4 generator. Good enough to satisfy uuid() validators.
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,

      addItem: (shape, scent, price, color, quantity, size, hasLavenderPieces, variantId) => {
        if (get().items.length >= MAX_CART_ITEMS) {
          return false;
        }
        const q = parseInt(quantity, 10);
        const cleanPrice = Number.isFinite(price) && price >= 0 ? price : 0;
        // Prefer the real catalog UUID when one is supplied. The server's checkout
        // schema validates `variantId` as a UUID, so we MUST not fall back to the
        // human-readable string. If no UUID is available, mint one client-side so
        // the request still reaches the server (it'll be rejected with "variant
        // not found" by the checkout handler, which is the right error to surface).
        const resolvedVariantId = isUuid(variantId) ? variantId : safeUuid();
        const newItem: CartItem = {
          id: safeUuid(),
          variantId: resolvedVariantId,
          shape,
          scent,
          price: cleanPrice,
          color,
          quantity: Number.isFinite(q) && q > 0 ? q : 1,
          size: typeof size === 'string' && size.length > 0 ? size : '100',
          hasLavenderPieces: Boolean(hasLavenderPieces),
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
      version: 2,
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
              .filter(
                (raw): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null,
              )
              .map((raw) => {
                const q = parseInt(String(raw.quantity), 10);
                const p = parseFloat(String(raw.price));
                const rawVariantId = typeof raw.variantId === 'string' ? raw.variantId : 'unknown';
                return {
                  id: typeof raw.id === 'string' ? raw.id : safeUuid(),
                  variantId: isUuid(rawVariantId) ? rawVariantId : safeUuid(),
                  shape: typeof raw.shape === 'string' ? raw.shape : 'Unknown',
                  scent: typeof raw.scent === 'string' ? raw.scent : 'Unknown',
                  price: Number.isFinite(p) && p >= 0 ? p : 0,
                  color: typeof raw.color === 'string' ? raw.color : 'Unknown',
                  quantity: Number.isFinite(q) && q > 0 ? q : 1,
                  size: typeof raw.size === 'string' && raw.size.length > 0 ? raw.size : '100',
                  hasLavenderPieces:
                    typeof raw.hasLavenderPieces === 'boolean' ? raw.hasLavenderPieces : false,
                  addedAt: typeof raw.addedAt === 'string' ? raw.addedAt : new Date().toISOString(),
                };
              });

            const totalQuantity = computeTotalQuantity(cleanItems);

            return {
              state: { items: cleanItems, totalQuantity },
              version: 2,
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

    const hasLegacy = items.some((item) => {
      if (typeof item !== 'object' || item === null) return true;
      const rec = item as Record<string, unknown>;
      if (typeof rec.variantId !== 'string') return true;
      if (typeof rec.size !== 'string') return true;
      if (typeof rec.hasLavenderPieces !== 'boolean') return true;
      if (!isUuid(rec.variantId)) return true;
      return false;
    });

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
