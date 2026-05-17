import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types/cart";

const CART_KEY = "organic-soap-cart";
const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_CART_ITEMS = 20;

interface CartStore {
  items: CartItem[];
  totalQuantity: number;
  addItem: (
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
  ) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,

      addItem: (shape, scent, price, color, quantity, size, hasLavenderPieces) => {
        const { items } = get();
        if (items.length >= MAX_CART_ITEMS) {
          console.warn("[Cart] Cannot add item - cart limit reached");
          return false;
        }
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          shape,
          scent,
          price,
          color,
          quantity: parseInt(quantity, 10),
          size,
          hasLavenderPieces,
          addedAt: new Date().toISOString(),
        };
        const newItems = [...items, newItem];
        set({ items: newItems, totalQuantity: calculateTotal(newItems) });
        return true;
      },

      removeItem: (itemId) => {
        const { items } = get();
        const filtered = items.filter((item) => item.id !== itemId);
        set({ items: filtered, totalQuantity: calculateTotal(filtered) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        const { items } = get();
        const updated = items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
        set({ items: updated, totalQuantity: calculateTotal(updated) });
      },

      clearCart: () => {
        set({ items: [], totalQuantity: 0 });
      },
    }),
    {
      name: CART_KEY,
      storage: {
        getItem: (name) => {
          try {
            const raw = localStorage.getItem(name);
            if (!raw) return null;
            const parsed: { state: { items: CartItem[] }; updatedAt?: number } = JSON.parse(raw);
            const savedRaw = localStorage.getItem(name);
            if (savedRaw) {
              const original = JSON.parse(savedRaw);
              const updatedAt = original.updatedAt || Date.now();
              if (Date.now() - updatedAt > CART_EXPIRY_MS) {
                localStorage.removeItem(name);
                return null;
              }
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const data = {
              items: value.state.items,
              updatedAt: Date.now(),
            };
            localStorage.setItem(name, JSON.stringify(data));
          } catch (error) {
            console.error("[Cart] Failed to save cart to localStorage:", error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error("[Cart] Failed to remove cart from localStorage:", error);
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.totalQuantity = calculateTotal(state.items);
        }
      },
    },
  ),
);
