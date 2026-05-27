import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAdminOptions, useUpdateAdminOptions } from '@/hooks/useAdminCatalog';

export const Route = createFileRoute('/admin/options')({
  component: AdminOptions,
});

export function AdminOptions() {
  const { data: options, isLoading, error } = useAdminOptions();
  const updateOptions = useUpdateAdminOptions();

  const [form, setForm] = useState({
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
  });

  useEffect(() => {
    if (options) {
      setForm({
        minPrice: String(options.minPrice),
        maxPrice: String(options.maxPrice),
        minSize: String(options.minSize),
        maxSize: String(options.maxSize),
      });
    }
  }, [options]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOptions.mutateAsync({
      minPrice: Number(form.minPrice),
      maxPrice: Number(form.maxPrice),
      minSize: Number(form.minSize),
      maxSize: Number(form.maxSize),
    });
  };

  if (isLoading) return <div className="p-6 text-stone-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Options</h1>

      <div className="bg-white p-6 rounded-lg shadow max-w-lg">
        <p className="text-sm text-stone-500 mb-4">
          Configure the allowed price range and size range for products.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Min Price (cents)</label>
              <input
                type="number"
                value={form.minPrice}
                onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Max Price (cents)</label>
              <input
                type="number"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Min Size (grams)</label>
              <input
                type="number"
                value={form.minSize}
                onChange={(e) => setForm({ ...form, minSize: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Max Size (grams)</label>
              <input
                type="number"
                value={form.maxSize}
                onChange={(e) => setForm({ ...form, maxSize: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-md"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
          >
            Save Options
          </button>
        </form>
      </div>
    </div>
  );
}