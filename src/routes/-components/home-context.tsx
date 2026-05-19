import type React from 'react';
import { useRef, useCallback, useState, createContext, useContext } from 'react';
import { useCart } from '../../hooks/useCart';
import { submitCartToWebhook } from '../../services/webhook';
import { useFormPersistence } from '../../hooks/useFormPersistence';
import type { Customer } from '../../types/webhook';
import type { CartItem } from '../../types/cart';

interface HomeContextValue {
  cart: { items: CartItem[]; totalQuantity: number };
  formSectionRef: React.RefObject<HTMLDivElement | null>;
  showLanding: boolean;
  setShowLanding: (v: boolean) => void;
  handleShopClick: () => void;
  handleAddToCart: (
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
  ) => void;
  handleCheckout: (customer: Customer) => Promise<void>;
  handleDismissOrdered: () => void;
  isSubmitting: boolean;
  justOrdered: boolean;
  confirmationItemCount: number;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const HomeContext = createContext<HomeContextValue | null>(null);

export function useHomeContext(): HomeContextValue {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error('useHomeContext must be used within HomeProvider');
  return ctx;
}

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const { cart, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const { clearFormState } = useFormPersistence();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationItemCount, setConfirmationItemCount] = useState(0);
  const [justOrdered, setJustOrdered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const handleShopClick = useCallback(() => {
    setShowLanding(false);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const handleAddToCart = useCallback((
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: number,
    hasLavenderPieces: boolean,
  ) => {
    const success = addItem(shape, scent, price, color, quantity, size, hasLavenderPieces);
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [addItem]);

  const handleCheckout = useCallback(async (customer: Customer) => {
    setIsSubmitting(true);
    try {
      const result = await submitCartToWebhook(customer, cart.items);
      if (result.success) {
        setConfirmationItemCount(cart.totalQuantity);
        setJustOrdered(true);
        clearCart();
        clearFormState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('Order submission failed');
      }
    } catch (err) {
      console.error('Order submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, clearCart, clearFormState]);

  const handleDismissOrdered = useCallback(() => {
    setJustOrdered(false);
  }, []);

  return (
    <HomeContext.Provider
      value={{
        cart,
        formSectionRef,
        showLanding,
        setShowLanding,
        handleShopClick,
        handleAddToCart,
        handleCheckout,
        handleDismissOrdered,
        isSubmitting,
        justOrdered,
        confirmationItemCount,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}
