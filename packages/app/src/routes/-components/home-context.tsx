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
  cartFullNotice: boolean;
  dismissCartFullNotice: () => void;
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
  const [cartFullNotice, setCartFullNotice] = useState(false);

  // AbortController for in-flight checkout so the request is cancelled on
  // unmount or when the user navigates away mid-submission.
  const inFlightController = useRef<AbortController | null>(null);
  // Track deferred-scroll timers so they can be cleared on unmount instead
  // of running against a detached ref.
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // detectAndClearLegacyCart() is itself a no-op when there's nothing
    // legacy in localStorage, so the localStorage round-trip is cheap
    // and we don't gate the call on cart contents (which race with
    // persist rehydration on first mount).
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

  const dismissCartFullNotice = useCallback(() => {
    setCartFullNotice(false);
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
        setCartFullNotice(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Tell the form why the click did nothing.
        setCartFullNotice(true);
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
      // Read the latest cart snapshot inside the callback so this handler
      // is stable across renders and doesn't re-create downstream handlers.
      const { items, totalQuantity } = useCartStore.getState();
      const releaseController = () => {
        if (inFlightController.current === controller) {
          inFlightController.current = null;
        }
        setIsSubmitting(false);
      };
      const finalizeSuccess = (ref: string) => {
        setConfirmationItemCount(totalQuantity);
        setLastOrderReference(ref);
        setJustOrdered(true);
        clearCart();
        clearFormState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        releaseController();
        return ref;
      };

      const fail = () => {
        releaseController();
        return undefined;
      };

      try {
        const checkoutItems = items.map((item) => ({
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

        if (response.status >= 400 && response.status < 500) {
          console.error(`[Checkout] API client error ${response.status}, not falling back to Web3Forms`);
          return fail();
        }

        console.warn(`[Checkout] API server error ${response.status}, falling back to Web3Forms`);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return fail();
        }
        console.warn('[Checkout] API error, falling back to Web3Forms:', err);
      }

      try {
        const result = await submitCartToWebhook(customer, items, undefined, undefined, {
          signal: controller.signal,
        });
        if (result.success) {
          const ref = `LTR-${result.orderId.slice(0, 8).toUpperCase()}`;
          return finalizeSuccess(ref);
        }
        console.error('[Checkout] Web3Forms submission did not succeed');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return fail();
        console.error('Order submission error:', err);
      } finally {
        // releaseController() runs inside finalizeSuccess/fail for the success
        // path. For the Web3Forms-failure path, release here so the spinner
        // never gets stuck.
        if (inFlightController.current === controller) {
          inFlightController.current = null;
          setIsSubmitting(false);
        }
      }
      return fail();
    },
    [clearCart, clearFormState],
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
        cartFullNotice,
        dismissCartFullNotice,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}
