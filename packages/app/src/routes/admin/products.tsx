import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/products')({
  component: AdminProducts,
});

function AdminProducts() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Product Management</h1>
      <p className="text-stone-600">Manage your products here.</p>
    </div>
  );
}