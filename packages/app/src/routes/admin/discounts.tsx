import { createFileRoute, Link } from '@tanstack/react-router';
import { useAdminDiscounts } from '@/hooks/useAdminCatalog';
import { useAdminStore } from '@/stores/useAdminStore';

export const Route = createFileRoute('/admin/discounts')({
  component: AdminDiscountsPage,
});

function AdminDiscountsPage() {
  const authToken = useAdminStore((s) => s.authToken);
  const { data: discounts, isLoading } = useAdminDiscounts();

  if (!authToken) return null;
  if (isLoading) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-6">
      <Link to="/admin" className="text-amber-600 hover:underline text-sm">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold mt-2 mb-4">Discounts</h1>
      <ul className="space-y-2">
        {discounts?.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
          >
            <span>
              {d.percentage}% — {d.description}
            </span>
            <span className="text-sm text-stone-500">{d.active ? 'active' : 'inactive'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
