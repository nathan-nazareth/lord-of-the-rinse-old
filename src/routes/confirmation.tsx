import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { useHomeContext } from './-components/home-context';
import ConfirmationPage from '../components/ConfirmationPage';

function ConfirmationContent() {
  const navigate = useNavigate();
  const { confirmationItemCount } = useHomeContext();

  return (
    <ConfirmationPage itemCount={confirmationItemCount} onContinue={() => navigate({ to: '/' })} />
  );
}

export const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/confirmation',
  beforeLoad: () => {
    document.title = 'Order Confirmed';
  },
  component: ConfirmationContent,
});
