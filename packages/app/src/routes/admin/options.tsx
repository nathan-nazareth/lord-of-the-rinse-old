import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import * as React from 'react';
import { useAdminOptions, useUpdateAdminOptions } from '@/hooks/useAdminCatalog';
import { useAdminStore } from '@/stores/useAdminStore';

const FIELDS = ['minPrice', 'maxPrice', 'minSize', 'maxSize'] as const;
type Field = (typeof FIELDS)[number];

function validateField(field: Field, raw: unknown): number | string {
  if (raw === null || raw === undefined || raw === '') {
    return `${field} is required`;
  }
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) {
    return `${field} must be a non-negative integer ≤ 1,000,000`;
  }
  return n;
}

export const Route = createFileRoute('/admin/options')({
  beforeLoad: () => {
    if (!useAdminStore.getState().isAuthenticated) {
      throw redirect({ to: '/admin' });
    }
  },
  component: AdminOptionsPage,
});

function AdminOptionsPage() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const { data: options, isLoading } = useAdminOptions();
  const update = useUpdateAdminOptions();
  const [fieldError, setFieldError] = React.useState<string | null>(null);

  if (!isAuthenticated) return null;
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
          setFieldError(null);
          const form = e.currentTarget;
          const data = new FormData(form);
          const values: Record<Field, number> = {} as Record<Field, number>;
          for (const field of FIELDS) {
            const v = validateField(field, data.get(field));
            if (typeof v === 'string') {
              setFieldError(v);
              return;
            }
            values[field] = v;
          }
          if (values.maxPrice < values.minPrice) {
            setFieldError('maxPrice must be ≥ minPrice');
            return;
          }
          if (values.maxSize < values.minSize) {
            setFieldError('maxSize must be ≥ minSize');
            return;
          }
          update.mutate(values);
        }}
        className="space-y-3 max-w-sm"
      >
        {FIELDS.map((field) => (
          <label key={field} className="block text-sm">
            <span className="block font-medium mb-1">{field}</span>
            <input
              name={field}
              type="number"
              defaultValue={options[field]}
              required
              min={0}
              step={1}
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
        {fieldError && <p className="text-red-600 text-sm">{fieldError}</p>}
        {update.isError && <p className="text-red-600 text-sm">Failed to save options</p>}
        {update.isSuccess && <p className="text-green-600 text-sm">Saved</p>}
      </form>
    </div>
  );
}
