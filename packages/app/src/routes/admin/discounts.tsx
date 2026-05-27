import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/discounts')({
  component: AdminDiscounts,
});

function AdminDiscounts() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Discount Management</h1>
      <p className="text-stone-600">Create and manage discount codes.</p>
    </div>
  );
}