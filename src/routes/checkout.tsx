import { createFileRoute, useNavigate } from '@tanstack/react-router';
import CheckoutPage from '../components/CheckoutPage';
import { useHomeContext } from './-components/home-context';

function CheckoutContent() {
  const navigate = useNavigate();
  const { cart, handleCheckout, isSubmitting } = useHomeContext();

  if (cart.totalQuantity === 0) {
    navigate({ to: '/cart', replace: true });
    return null;
  }

  return (
    <CheckoutPage
      cart={cart}
      onBack={() => navigate({ to: '/cart' })}
      onSubmit={handleCheckout}
      isSubmitting={isSubmitting}
    />
  );
}

export const Route = createFileRoute('/checkout')({
  beforeLoad: () => {
    document.title = 'Checkout';
  },
  component: CheckoutContent,
});
