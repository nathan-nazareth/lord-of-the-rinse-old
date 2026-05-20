import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ConfirmationPage from '../components/ConfirmationPage';
import { useHomeContext } from './-components/home-context';

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
