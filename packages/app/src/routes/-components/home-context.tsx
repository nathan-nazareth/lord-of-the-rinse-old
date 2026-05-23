import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { submitCartToWebhook } from '../../services/webhook';
import { detectAndClearLegacyCart, useCartStore } from '../../stores/useCartStore';
import { useFormStore } from '../../stores/useFormStore';
import type { CartItem } from '../../types/cart';
import type { Customer } from '../../types/webhook';

interface HomeContextValue {
  cart: { items: CartItem[]; totalQuantity: number };
  formSectionRef: React.RefObject<HTMLDivElement | null>;
  showLanding: boolean;
  setShowLanding: (v: boolean) => void;
  handleShopClick: () => void;
  handleAddToCart: (
    variantId: string,
    shape: string,
    scent: string,
    price: number,
    color: string,
    quantity: string,
    size: string,
  ) => void;
  handleCheckout: (customer: Customer) => Promise<void>;
  handleDismissOrdered: () => void;
  isSubmitting: boolean;
  justOrdered: boolean;
  confirmationItemCount: number;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  legacyCartCleared: boolean;
  dismissLegacyToast: () => void;
}

const HomeContext = createContext<HomeContextValue | null>(null);

export function useHomeContext(): HomeContextValue {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error('useHomeContext must be used within HomeProvider');
  return ctx;
}

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((s) => s.items);
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const cart = useMemo(() => ({ items, totalQuantity }), [items, totalQuantity]);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearFormState = useFormStore((s) => s.clear);
  const setVisited = useFormStore((s) => s.setVisited);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationItemCount, setConfirmationItemCount] = useState(0);
  const [justOrdered, setJustOrdered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [legacyCartCleared, setLegacyCartCleared] = useState(false);

  // Detect and clear legacy cart items on mount
  useEffect(() => {
    const cleared = detectAndClearLegacyCart();
    if (cleared) {
      setLegacyCartCleared(true);
    }
  }, []);

  const dismissLegacyToast = useCallback(() => {
    setLegacyCartCleared(false);
  }, []);

  const handleShopClick = useCallback(() => {
    setShowLanding(false);
    setVisited();
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [setVisited]);

  const handleAddToCart = useCallback(
    (
      variantId: string,
      shape: string,
      scent: string,
      price: number,
      color: string,
      quantity: string,
      size: string,
    ) => {
      const success = addItem(variantId, shape, scent, price, color, quantity, size);
      if (success) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [addItem],
  );

  const handleCheckout = useCallback(
    async (customer: Customer) => {
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
    },
    [cart, clearCart, clearFormState],
  );

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
        legacyCartCleared,
        dismissLegacyToast,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}
