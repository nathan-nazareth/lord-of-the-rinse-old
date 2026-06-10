import { createFileRoute, Link } from '@tanstack/react-router';
import { useAdminOptions, useUpdateAdminOptions } from '@/hooks/useAdminCatalog';
import { useAdminStore } from '@/stores/useAdminStore';

export const Route = createFileRoute('/admin/options')({
  component: AdminOptionsPage,
});

function AdminOptionsPage() {
  const authToken = useAdminStore((s) => s.authToken);
  const { data: options, isLoading } = useAdminOptions();
  const update = useUpdateAdminOptions();

  if (!authToken) return null;
  if (isLoading || !options) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-6">
      <Link to="/admin" className="text-amber-600 hover:underline text-sm">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold mt-2 mb-4">Catalog options</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          update.mutate({
            minPrice: Number(data.get('minPrice')),
            maxPrice: Number(data.get('maxPrice')),
            minSize: Number(data.get('minSize')),
            maxSize: Number(data.get('maxSize')),
          });
        }}
        className="space-y-3 max-w-sm"
      >
        {(['minPrice', 'maxPrice', 'minSize', 'maxSize'] as const).map((field) => (
          <label key={field} className="block text-sm">
            <span className="block font-medium mb-1">{field}</span>
            <input
              name={field}
              type="number"
              defaultValue={options[field]}
              required
              className="w-full border rounded px-2 py-1"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={update.isPending}
          className="bg-amber-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {update.isPending ? 'Saving…' : 'Save'}
        </button>
        {update.isError && <p className="text-red-600 text-sm">Failed to save options</p>}
        {update.isSuccess && <p className="text-green-600 text-sm">Saved</p>}
      </form>
    </div>
  );
}
