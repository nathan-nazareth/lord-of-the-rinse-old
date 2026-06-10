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
import { detectAndClearLegacyCart, useCartStore } from '../../stores/useCartStore';
import { useFormStore } from '../../stores/useFormStore';
import type { CartItem } from '../../types/cart';
import type { Customer } from '../../types/webhook';
import { submitCartToWebhook } from '../../services/webhook';

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
    size: string,
  ) => void;
  handleCheckout: (customer: Customer) => Promise<string | undefined>;
  handleDismissOrdered: () => void;
  isSubmitting: boolean;
  justOrdered: boolean;
  confirmationItemCount: number;
  lastOrderReference: string;
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
  const [lastOrderReference, setLastOrderReference] = useState('');
  const [justOrdered, setJustOrdered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [legacyCartCleared, setLegacyCartCleared] = useState(false);

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
      shape: string,
      scent: string,
      price: number,
      color: string,
      quantity: string,
      size: string,
    ) => {
      const success = addItem(shape, scent, price, color, quantity, size);
      if (success) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [addItem],
  );

  const handleCheckout = useCallback(
    async (customer: Customer): Promise<string | undefined> => {
      setIsSubmitting(true);
      const finalizeSuccess = (ref: string) => {
        setConfirmationItemCount(cart.totalQuantity);
        setLastOrderReference(ref);
        setJustOrdered(true);
        clearCart();
        clearFormState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return ref;
      };

      try {
        const checkoutItems = cart.items.map((item) => ({
          variantId: item.variantId,
          displayName: `${item.scent} (${item.shape}, ${item.color}, ${item.size}g)`,
          quantity: item.quantity,
          unitPrice: item.price.toFixed(2),
        }));

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            items: checkoutItems,
          }),
        });

        if (response.ok) {
          let data: { reference?: string } = {};
          try {
            data = (await response.json()) as { reference?: string };
          } catch {
            console.error('[Checkout] Server returned a non-JSON success response');
            return undefined;
          }
          if (!data.reference) {
            console.error('[Checkout] Server response missing reference');
            return undefined;
          }
          return finalizeSuccess(data.reference);
        }

        console.warn(`[Checkout] API responded ${response.status}, falling back to Web3Forms`);
      } catch (err) {
        console.warn('[Checkout] API error, falling back to Web3Forms:', err);
      }

      try {
        const result = await submitCartToWebhook(customer, cart.items);
        if (result.success) {
          const ref = `LTR-${result.orderId.slice(0, 8).toUpperCase()}`;
          return finalizeSuccess(ref);
        }
      } catch (err) {
        console.error('Order submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
      return undefined;
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
        lastOrderReference,
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
