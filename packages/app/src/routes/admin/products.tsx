import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAdminStore } from '@/stores/useAdminStore';

export const Route = createFileRoute('/admin/products')({
  component: AdminProductsLayout,
});

function AdminProductsLayout() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const authToken = useAdminStore((s) => s.authToken);

  if (!isAuthenticated || !authToken) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Admin sign-in required</h1>
        <a href="/admin" className="text-amber-600 hover:underline">
          Go to login
        </a>
      </div>
    );
  }
  return <Outlet />;
}
