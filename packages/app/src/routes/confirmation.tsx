import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import ConfirmationPage from '../components/ConfirmationPage';
import { useHomeContext } from './-components/home-context';
function ConfirmationContent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/confirmation' });
  const { confirmationItemCount, lastOrderReference } = useHomeContext();

  // Prefer the order reference and item count from the URL — those survive a
  // page refresh and work when the user lands here from an external link.
  const orderReference =
    (typeof search.ref === 'string' && search.ref.length > 0 ? search.ref : lastOrderReference) ||
    undefined;

  const itemCount =
    typeof search.count === 'number' && search.count > 0 ? search.count : confirmationItemCount;

  return (
    <ConfirmationPage
      itemCount={itemCount}
      orderReference={orderReference}
      onContinue={() => navigate({ to: '/' })}
    />
  );
}

export const Route = createFileRoute('/confirmation')({
  validateSearch: (search: Record<string, unknown>): { ref?: string; count?: number } => {
    const ref = typeof search.ref === 'string' ? search.ref : undefined;
    let count: number | undefined;
    if (typeof search.count === 'string') {
      const parsed = Number.parseInt(search.count, 10);
      if (Number.isFinite(parsed) && parsed >= 0) count = parsed;
    } else if (typeof search.count === 'number' && Number.isFinite(search.count)) {
      count = search.count;
    }
    return { ref, count };
  },
  beforeLoad: () => {
    document.title = 'Order Confirmed';
  },
  component: ConfirmationContent,
});
