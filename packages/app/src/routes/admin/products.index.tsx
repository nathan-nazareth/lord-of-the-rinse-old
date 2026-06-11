import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useAdminProducts, useDeleteProduct } from '@/hooks/useAdminCatalog';
import { useAdminStore } from '@/stores/useAdminStore';

export const Route = createFileRoute('/admin/products/')({
  beforeLoad: () => {
    if (!useAdminStore.getState().isAuthenticated) {
      throw redirect({ to: '/admin' });
    }
  },
  component: AdminProductsIndex,
});

function AdminProductsIndex() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const { data: products, isLoading, error } = useAdminProducts();
  const deleteProduct = useDeleteProduct();

  if (!isAuthenticated) return null;
  if (isLoading) return <div className="p-8">Loading products…</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load products</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link to="/admin" className="text-amber-600 hover:underline text-sm">
          ← Back
        </Link>
      </div>
      {deleteProduct.isError && (
        <p className="text-red-600 text-sm mb-3">
          Failed to delete product: {deleteProduct.error?.message ?? 'Unknown error'}
        </p>
      )}
      <ul className="space-y-2">
        {products?.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
          >
            <span>
              {p.name} — {p.shape} / {p.scent} / {p.color}
            </span>
            <button
              type="button"
              onClick={() => deleteProduct.mutate(p.id)}
              disabled={deleteProduct.isPending}
              className="text-red-500 text-sm hover:underline disabled:opacity-50"
            >
              {deleteProduct.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
