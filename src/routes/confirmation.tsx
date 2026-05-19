import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useHomeContext } from './-components/home-context';
import ConfirmationPage from '../components/ConfirmationPage';

function ConfirmationContent() {
  const navigate = useNavigate();
  const { confirmationItemCount } = useHomeContext();

  return (
    <ConfirmationPage itemCount={confirmationItemCount} onContinue={() => navigate({ to: '/' })} />
  );
}

export const Route = createFileRoute('/confirmation')({
  beforeLoad: () => {
    document.title = 'Order Confirmed';
  },
  component: ConfirmationContent,
});
