import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount } from '@/hooks/useAdminCatalog';
import { IconTrash, IconEdit } from '@tabler/icons-react';

export const Route = createFileRoute('/admin/discounts')({
  component: AdminDiscounts,
});

export function AdminDiscounts() {
  const { data: discounts, isLoading, error } = useAdminDiscounts();
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();

  const [form, setForm] = useState({ percentage: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ percentage: '', description: '', active: 1 });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDiscount.mutateAsync({
      percentage: Number(form.percentage),
      description: form.description,
    });
    setForm({ percentage: '', description: '' });
  };

  const handleEdit = (discount: typeof discounts[0]) => {
    setEditingId(discount.id);
    setEditForm({
      percentage: String(discount.percentage),
      description: discount.description,
      active: discount.active,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    await updateDiscount.mutateAsync({
      id: editingId,
      data: {
        percentage: Number(editForm.percentage),
        description: editForm.description,
        active: editForm.active,
      },
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this discount?')) {
      await deleteDiscount.mutateAsync(id);
    }
  };

  if (isLoading) return <div className="p-6 text-stone-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Discounts</h1>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-3">
        <input
          type="number"
          placeholder="Percentage"
          value={form.percentage}
          onChange={(e) => setForm({ ...form, percentage: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md w-32"
          min="0"
          max="100"
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="px-3 py-2 border border-stone-300 rounded-md flex-1"
          required
        />
        <button
          type="submit"
          className="bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
        >
          Add Discount
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Percentage</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {discounts?.map((discount) => (
              <tr key={discount.id} className="border-t border-stone-200">
                <td className="px-4 py-3 text-stone-800">{discount.percentage}%</td>
                <td className="px-4 py-3 text-stone-600">{discount.description}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm px-2 py-1 rounded ${discount.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {discount.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(discount)} className="text-blue-600 hover:text-blue-700">
                    <IconEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(discount.id)} className="text-red-600 hover:text-red-700">
                    <IconTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {discounts?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                  No discounts yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-stone-800 mb-4">Edit Discount</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Percentage</label>
                <input
                  type="number"
                  value={editForm.percentage}
                  onChange={(e) => setEditForm({ ...editForm, percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.active === 1}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked ? 1 : 0 })}
                />
                <label className="text-sm text-stone-700">Active</label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="bg-stone-200 text-stone-700 py-2 px-4 rounded-md hover:bg-stone-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}