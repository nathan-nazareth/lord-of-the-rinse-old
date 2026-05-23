import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import CheckoutPage from '../components/CheckoutPage';
import { useHomeContext } from './-components/home-context';

function CheckoutContent() {
  const navigate = useNavigate();
  const { cart, handleCheckout, isSubmitting } = useHomeContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (cart.totalQuantity === 0 && !submittedRef.current) {
      navigate({ to: '/cart', replace: true });
    }
  }, [cart.totalQuantity, navigate]);

  if (cart.totalQuantity === 0 && !submittedRef.current) {
    return null;
  }

  return (
    <CheckoutPage
      cart={cart}
      onBack={() => navigate({ to: '/cart' })}
      onSubmit={async (customer) => {
        submittedRef.current = true;
        setErrorMessage(null);
        const reference = await handleCheckout(customer);
        if (reference) {
          await navigate({ to: '/confirmation', search: { ref: reference } });
        } else {
          setErrorMessage('Failed to place order. Please try again.');
          submittedRef.current = false;
        }
      }}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onClearError={() => setErrorMessage(null)}
    />
  );
}

export const Route = createFileRoute('/checkout')({
  beforeLoad: () => {
    document.title = 'Checkout';
  },
  component: CheckoutContent,
});
