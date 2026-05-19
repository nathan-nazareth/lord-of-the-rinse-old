import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { useHomeContext } from './-components/home-context';
import CheckoutPage from '../components/CheckoutPage';

function CheckoutContent() {
  const navigate = useNavigate();
  const {
    cart,
    handleCheckout,
    isSubmitting,
  } = useHomeContext();

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

export const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutContent,
});
