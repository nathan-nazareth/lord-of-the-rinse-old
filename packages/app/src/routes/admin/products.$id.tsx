import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/products/$id')({
  component: AdminProductEdit,
});

function AdminProductEdit() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Edit Product</h1>
      <p className="text-stone-600">Edit product details.</p>
    </div>
  );
}