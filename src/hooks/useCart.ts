import { useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '../types/cart';
import { saveCart, loadCart, removeItem, clearCart, createCartItem, calculateTotal, canAddToCart } from '../services/cart';

interface UseCartReturn {
  cart: Cart;
  addItem: (scent: string, price: number, color: string, quantity: string, size: number) => boolean;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart>({ items: [], totalQuantity: 0, updatedAt: new Date().toISOString() });
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const addItem = useCallback((
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: number
  ): boolean => {
    if (!canAddToCart(cart.items)) {
      console.warn('[Cart] Cannot add item - cart limit reached');
      return false;
    }

    const newItem = createCartItem(scent, price, color, quantity, size);
    const newItems = [...cart.items, newItem];
    
    setCart({
      items: newItems,
      totalQuantity: calculateTotal(newItems),
      updatedAt: new Date().toISOString()
    });

    return true;
  }, [cart.items]);

  const removeItemById = useCallback((itemId: string) => {
    const updatedCart = removeItem(cart, itemId);
    setCart(updatedCart);
    
    if (updatedCart.items.length === 0) {
      clearCart();
    }
  }, [cart]);

  const clearCartState = useCallback(() => {
    setCart({ items: [], totalQuantity: 0, updatedAt: new Date().toISOString() });
    clearCart();
  }, []);

  return {
    cart,
    addItem,
    removeItem: removeItemById,
    clearCart: clearCartState,
    isCartOpen,
    setIsCartOpen
  };
}
