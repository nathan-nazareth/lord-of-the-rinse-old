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
    hasLavenderPieces: boolean,
    variantId?: string,
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

  // AbortController for in-flight checkout so the request is cancelled on
  // unmount or when the user navigates away mid-submission.
  const inFlightController = useRef<AbortController | null>(null);
  // Track deferred-scroll timers so they can be cleared on unmount instead
  // of running against a detached ref.
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cleared = detectAndClearLegacyCart();
    if (cleared) {
      setLegacyCartCleared(true);
    }
  }, []);

  // Cancel any pending checkout on unmount and clear any pending scroll timer.
  useEffect(() => {
    return () => {
      inFlightController.current?.abort();
      inFlightController.current = null;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

  const dismissLegacyToast = useCallback(() => {
    setLegacyCartCleared(false);
  }, []);

  const handleShopClick = useCallback(() => {
    setShowLanding(false);
    setVisited();
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
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
      hasLavenderPieces: boolean,
      variantId?: string,
    ) => {
      const success = addItem(
        shape,
        scent,
        price,
        color,
        quantity,
        size,
        hasLavenderPieces,
        variantId,
      );
      if (success) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [addItem],
  );

  const handleCheckout = useCallback(
    async (customer: Customer): Promise<string | undefined> => {
      // Cancel any previous in-flight request before starting a new one.
      inFlightController.current?.abort();
      const controller = new AbortController();
      inFlightController.current = controller;

      setIsSubmitting(true);
      const finalizeSuccess = (ref: string) => {
        if (inFlightController.current === controller) {
          inFlightController.current = null;
        }
        setConfirmationItemCount(cart.totalQuantity);
        setLastOrderReference(ref);
        setJustOrdered(true);
        clearCart();
        clearFormState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return ref;
      };

      const fail = () => {
        if (inFlightController.current === controller) {
          inFlightController.current = null;
        }
        return undefined;
      };

      try {
        const checkoutItems = cart.items.map((item) => ({
          variantId: item.variantId,
          displayName: `${item.scent} (${item.shape}, ${item.color}, ${item.size}g${item.hasLavenderPieces ? ', lavender pieces' : ''})`,
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
          signal: controller.signal,
        });

        if (response.ok) {
          let data: { reference?: string } = {};
          try {
            data = (await response.json()) as { reference?: string };
          } catch (err) {
            console.error('[Checkout] Server returned a non-JSON success response', err);
            return fail();
          }
          if (!data.reference) {
            console.error('[Checkout] Server response missing reference');
            return fail();
          }
          return finalizeSuccess(data.reference);
        }

        console.warn(`[Checkout] API responded ${response.status}, falling back to Web3Forms`);
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') {
          return fail();
        }
        console.warn('[Checkout] API error, falling back to Web3Forms:', err);
      }

      try {
        const result = await submitCartToWebhook(customer, cart.items, undefined, undefined, {
          signal: controller.signal,
        });
        if (result.success) {
          const ref = `LTR-${result.orderId.slice(0, 8).toUpperCase()}`;
          return finalizeSuccess(ref);
        }
        console.error('[Checkout] Web3Forms submission did not succeed');
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return fail();
        console.error('Order submission error:', err);
      } finally {
        // CRITICAL: clear submitting in BOTH success and failure paths so the
        // loading spinner doesn't get stuck forever after a successful order.
        if (inFlightController.current === controller) {
          inFlightController.current = null;
          setIsSubmitting(false);
        }
      }
      return fail();
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
