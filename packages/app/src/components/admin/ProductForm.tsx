import { useState } from 'react';
import type { AdminProduct, UpdateProductRequest } from '@/types/admin';

interface ProductFormProps {
  product: AdminProduct;
  onSubmit: (data: UpdateProductRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    basePrice: product.basePrice / 100,
    minWeight: product.minWeight,
    maxWeight: product.maxWeight,
    enabled: product.enabled,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.basePrice < 0) {
      setError('Price must be positive');
      return;
    }

    if (formData.minWeight < 1) {
      setError('Minimum weight must be at least 1');
      return;
    }

    if (formData.maxWeight > 10000) {
      setError('Maximum weight cannot exceed 10000g');
      return;
    }

    if (formData.minWeight > formData.maxWeight) {
      setError('Minimum weight cannot exceed maximum weight');
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        basePrice: Math.round(formData.basePrice * 100),
        minWeight: formData.minWeight,
        maxWeight: formData.maxWeight,
        enabled: formData.enabled,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
          />
        </div>

        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-stone-700 mb-1">
            Base Price ($)
          </label>
          <input
            type="number"
            id="basePrice"
            step="0.01"
            min="0"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minWeight" className="block text-sm font-medium text-stone-700 mb-1">
              Min Weight (g)
            </label>
            <input
              type="number"
              id="minWeight"
              min="1"
              max={formData.maxWeight}
              value={formData.minWeight}
              onChange={(e) => setFormData({ ...formData, minWeight: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              required
            />
          </div>

          <div>
            <label htmlFor="maxWeight" className="block text-sm font-medium text-stone-700 mb-1">
              Max Weight (g)
            </label>
            <input
              type="number"
              id="maxWeight"
              min={formData.minWeight}
              max="10000"
              value={formData.maxWeight}
              onChange={(e) => setFormData({ ...formData, maxWeight: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enabled"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="h-4 w-4 text-stone-600 border-stone-300 rounded focus:ring-stone-500"
          />
          <label htmlFor="enabled" className="text-sm text-stone-700">
            Product Enabled
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-stone-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-md hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <span className="text-sm text-stone-500">
          Last updated: {new Date(product.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </form>
  );
}