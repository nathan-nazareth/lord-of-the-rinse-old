import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminProducts, useCreateProduct, useDeleteProduct } from '@/hooks/useAdminCatalog.ts';
import { IconTrash } from '@tabler/icons-react';

export const Route = createFileRoute('/admin/products')({
  component: AdminProducts,
});

export function AdminProducts() {
  const { data: products, isLoading, error } = useAdminProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();

  const [form, setForm] = useState({
    name: '',
    color: '',
    scent: '',
    shape: '',
    weight: '',
    price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct.mutateAsync({
      name: form.name,
      color: form.color,
      scent: form.scent,
      shape: form.shape,
      weight: Number(form.weight),
      price: Number(form.price),
    });
    setForm({ name: '', color: '', scent: '', shape: '', weight: '', price: '' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this product?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  if (isLoading) return <div className="p-6 text-stone-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Products</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-6 gap-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md"
          required
        />
        <select
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md"
          required
        >
          <option value="">Color</option>
          <option value="White">White</option>
          <option value="Yellow">Yellow</option>
          <option value="Pink">Pink</option>
          <option value="Green">Green</option>
          <option value="Blue">Blue</option>
          <option value="Purple">Purple</option>
        </select>
        <select
          value={form.scent}
          onChange={(e) => setForm({ ...form, scent: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md"
          required
        >
          <option value="">Scent</option>
          <option value="Lavender">Lavender</option>
          <option value="Citronella">Citronella</option>
          <option value="Coconut">Coconut</option>
          <option value="Lemongrass">Lemongrass</option>
        </select>
        <select
          value={form.shape}
          onChange={(e) => setForm({ ...form, shape: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md"
          required
        >
          <option value="">Shape</option>
          <option value="Square">Square</option>
          <option value="Circle">Circle</option>
          <option value="Heart">Heart</option>
          <option value="Oval">Oval</option>
        </select>
        <input
          type="number"
          placeholder="Weight (g)"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md"
          required
        />
        <input
          type="number"
          placeholder="Price (cents)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md"
          required
        />
        <button
          type="submit"
          className="col-span-6 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
        >
          Add Product
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Color</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Scent</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Shape</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Weight</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-t border-stone-200">
                <td className="px-4 py-3 text-stone-800">{product.name}</td>
                <td className="px-4 py-3 text-stone-600">{product.color}</td>
                <td className="px-4 py-3 text-stone-600">{product.scent}</td>
                <td className="px-4 py-3 text-stone-600">{product.shape}</td>
                <td className="px-4 py-3 text-stone-600">{product.weight}g</td>
                <td className="px-4 py-3 text-stone-600">${(product.price / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <IconTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-stone-500">
                  No products yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}