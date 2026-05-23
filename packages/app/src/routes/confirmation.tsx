import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ConfirmationPage from '../components/ConfirmationPage';
import { useHomeContext } from './-components/home-context';

function ConfirmationContent() {
  const navigate = useNavigate();
  const { confirmationItemCount, lastOrderReference } = useHomeContext();
  const search = Route.useSearch();
  const orderReference = (search as { ref?: string }).ref || lastOrderReference;

  return (
    <ConfirmationPage
      itemCount={confirmationItemCount}
      orderReference={orderReference}
      onContinue={() => navigate({ to: '/' })}
    />
  );
}

export const Route = createFileRoute('/confirmation')({
  beforeLoad: () => {
    document.title = 'Order Confirmed';
  },
  component: ConfirmationContent,
});
