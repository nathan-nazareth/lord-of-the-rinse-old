import { createFileRoute, Link, redirect, useParams } from '@tanstack/react-router';
import { useAdminProducts } from '@/hooks/useAdminCatalog';
import { useAdminStore } from '@/stores/useAdminStore';

export const Route = createFileRoute('/admin/products/$id')({
  // Server-side route guard: an unauthenticated visitor never sees the
  // product detail page, so the route doesn't even render.
  beforeLoad: () => {
    const store = useAdminStore.getState();
    if (store.isTokenExpired()) store.clearAuth();
    if (!store.isAuthenticated) {
      throw redirect({ to: '/admin' });
    }
  },
  component: AdminProductDetail,
});

function AdminProductDetail() {
  const { id } = useParams({ strict: false });
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const { data: products, isLoading } = useAdminProducts();
  const productId = typeof id === 'string' ? id : '';
  const product = products?.find((p) => String(p.id) === productId);

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Admin sign-in required</h1>
        <Link to="/admin" className="text-amber-600 hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  if (isLoading) return <div className="p-8">Loading…</div>;
  if (!product) {
    return (
      <div className="p-8">
        <h1 className="text-xl mb-4">Product not found</h1>
        <Link to="/admin/products" className="text-amber-600 hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/admin/products" className="text-amber-600 hover:underline text-sm">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold mt-2 mb-4">{product.name}</h1>
      <dl className="space-y-1 text-sm">
        <div>
          <dt className="inline font-medium">Shape: </dt>
          <dd className="inline">{product.shape}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Scent: </dt>
          <dd className="inline">{product.scent}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Color: </dt>
          <dd className="inline">{product.color}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Weight: </dt>
          <dd className="inline">{product.weight}g</dd>
        </div>
        <div>
          <dt className="inline font-medium">Price: </dt>
          <dd className="inline">Rs. {product.price}</dd>
        </div>
      </dl>
    </div>
  );
}
