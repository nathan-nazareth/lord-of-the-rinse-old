import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useAdminProducts } from '@/hooks/useAdminCatalog';

export const Route = createFileRoute('/admin/products/$id')({
  component: AdminProductDetail,
});

function AdminProductDetail() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: products, isLoading } = useAdminProducts();
  const product = products?.find((p) => String(p.id) === id);

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
