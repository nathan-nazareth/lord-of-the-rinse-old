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
        const q = parseInt(quantity, 10);
        const cleanPrice = Number.isFinite(price) && price >= 0 ? price : 0;
        const cleanSize = typeof size === 'string' && size.length > 0 ? size : '100';
        const cleanQty = Number.isFinite(q) && q > 0 ? q : 1;
        // Prefer the real catalog UUID when one is supplied. The server's checkout
        // schema validates `variantId` as a UUID, so we MUST not fall back to the
        // human-readable string. If no UUID is available, mint one client-side so
        // the request still reaches the server (it'll be rejected with "variant
        // not found" by the checkout handler, which is the right error to surface).
        const resolvedVariantId = isUuid(variantId) ? variantId : safeUuid();
        const cleanLavender = Boolean(hasLavenderPieces);

        // Merge with an existing matching line so the cart doesn't sprout
        // duplicates for the same shape/scent/color/size/addon combo. The
        // variantId is the primary identity for catalog matching; if both items
        // share a UUID, they're the same SKU.
        const currentItems = get().items;
        const existingIdx = currentItems.findIndex(
          (item) =>
            item.variantId === resolvedVariantId &&
            item.shape === shape &&
            item.scent === scent &&
            item.color === color &&
            item.size === cleanSize &&
            item.hasLavenderPieces === cleanLavender &&
            item.price === cleanPrice,
        );

        if (existingIdx >= 0) {
          const merged = currentItems.map((item, i) =>
            i === existingIdx ? { ...item, quantity: item.quantity + cleanQty } : item,
          );
          set({
            items: merged,
            totalQuantity: computeTotalQuantity(merged),
          });
          return true;
        }

        if (currentItems.length >= MAX_CART_ITEMS) {
          return false;
        }
        const newItem: CartItem = {
          id: safeUuid(),
          variantId: resolvedVariantId,
          shape,
          scent,
          price: cleanPrice,
          color,
          quantity: cleanQty,
          size: cleanSize,
          hasLavenderPieces: cleanLavender,
          addedAt: new Date().toISOString(),
        };
        const newItems = [...currentItems, newItem];
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

            const parsed: unknown = JSON.parse(item);
            if (typeof parsed !== 'object' || parsed === null) {
              localStorage.removeItem(name);
              return null;
            }

            const stateOrItems = (parsed as { state?: unknown }).state ?? parsed;
            if (typeof stateOrItems !== 'object' || stateOrItems === null) {
              localStorage.removeItem(name);
              return null;
            }

            const rawItems: unknown = (stateOrItems as { items?: unknown }).items;
            if (!Array.isArray(rawItems)) {
              localStorage.removeItem(name);
              return null;
            }

            const updatedAt = (stateOrItems as { updatedAt?: unknown }).updatedAt;
            if (typeof updatedAt === 'number') {
              if (Date.now() - updatedAt > CART_EXPIRY_MS) {
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
          } catch (err) {
            if (import.meta.env.DEV) {
              console.warn('[cart] persisted state unreadable, removing key', err);
            }
            try {
              localStorage.removeItem(name);
            } catch {
              // Ignore — quota / privacy mode errors don't need to crash.
            }
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Stamp the wall-clock so getItem() can enforce CART_EXPIRY_MS.
            // Without this, NaN > ms is always false and the cart never expires.
            const payload = { ...value, updatedAt: Date.now() };
            localStorage.setItem(name, JSON.stringify(payload));
          } catch (err) {
            // QuotaExceededError (cart + discounts + settings can easily
            // blow past the 5MB budget) or SecurityError (private mode).
            // Swallow so a misconfigured browser doesn't crash checkout;
            // the in-memory cart is still usable for the current session.
            if (import.meta.env.DEV) {
              console.warn('[useCartStore] failed to persist cart', err);
            }
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Ignore — privacy mode or sandboxed iframes may disable
            // localStorage; the in-memory store still works.
          }
        },
      },
    },
  ),
);

export function detectAndClearLegacyCart(): boolean {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return false;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return false;

    const items: unknown[] =
      (parsed as { state?: { items?: unknown[] } }).state?.items ??
      (parsed as { items?: unknown[] }).items ??
      [];

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
