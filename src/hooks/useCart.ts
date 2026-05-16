import { useState, useEffect, useCallback, useRef } from "react";
import { Cart, CartItem } from "../types/cart";
import {
  saveCart,
  loadCart,
  removeItem,
  clearCart,
  createCartItem,
  calculateTotal,
  canAddToCart,
} from "../services/cart";

interface UseCartReturn {
  cart: Cart;
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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalQuantity: 0,
    updatedAt: new Date().toISOString(),
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartRef = useRef(cart);
  cartRef.current = cart;

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCart();
    if (savedCart) {
      setCart(savedCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.items.length > 0) {
      saveCart(cart);
    }
  }, [cart]);

  const addItem = useCallback(
    (
      shape: string,
      scent: string,
      price: number,
      color: string,
      quantity: string,
      size: number,
      hasLavenderPieces: boolean,
    ): boolean => {
      const current = cartRef.current;
      if (!canAddToCart(current.items)) {
        console.warn("[Cart] Cannot add item - cart limit reached");
        return false;
      }

      const newItem = createCartItem(
        shape,
        scent,
        price,
        color,
        quantity,
        size,
        hasLavenderPieces,
      );
      const newItems = [...current.items, newItem];

      setCart({
        items: newItems,
        totalQuantity: calculateTotal(newItems),
        updatedAt: new Date().toISOString(),
      });

      return true;
    },
    [],
  );

  const removeItemById = useCallback(
    (itemId: string) => {
      const current = cartRef.current;
      const updatedCart = removeItem(current, itemId);
      setCart(updatedCart);

      if (updatedCart.items.length === 0) {
        clearCart();
      }
    },
    [],
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const current = cartRef.current;
      if (quantity < 1) {
        removeItemById(itemId);
        return;
      }
      const updatedItems = current.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setCart({
        items: updatedItems,
        totalQuantity: calculateTotal(updatedItems),
        updatedAt: new Date().toISOString(),
      });
    },
    [removeItemById],
  );

  const clearCartState = useCallback(() => {
    setCart({
      items: [],
      totalQuantity: 0,
      updatedAt: new Date().toISOString(),
    });
    clearCart();
  }, []);

  return {
    cart,
    addItem,
    removeItem: removeItemById,
    updateQuantity,
    clearCart: clearCartState,
    isCartOpen,
    setIsCartOpen,
  };
}
