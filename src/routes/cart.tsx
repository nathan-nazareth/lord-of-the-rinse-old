import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useHomeContext } from './-components/home-context';
import CartPage from '../components/CartPage';

function CartContent() {
  const navigate = useNavigate();
  const {
    cart,
    removeItem,
    updateQuantity,
    clearCart,
    justOrdered,
    confirmationItemCount,
    handleDismissOrdered,
    setShowLanding,
  } = useHomeContext();

  return (
    <CartPage
      cart={cart}
      onBackToForm={() => {
        setShowLanding(false);
        navigate({ to: '/' });
      }}
      onCheckout={() => navigate({ to: '/checkout' })}
      onRemoveItem={removeItem}
      onClearCart={clearCart}
      onUpdateQuantity={updateQuantity}
      justOrdered={justOrdered}
      orderedItemCount={confirmationItemCount}
      onDismissOrdered={handleDismissOrdered}
    />
  );
}

export const Route = createFileRoute('/cart')({
  beforeLoad: () => {
    document.title = 'Cart';
  },
  component: CartContent,
});
