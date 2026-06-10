import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { useAdminStore } from '@/stores/useAdminStore';

export const Route = createFileRoute('/admin/products')({
  beforeLoad: () => {
    if (!useAdminStore.getState().isAuthenticated) {
      throw redirect({ to: '/admin' });
    }
  },
  component: AdminProductsLayout,
});

function AdminProductsLayout() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const authToken = useAdminStore((s) => s.authToken);

  if (!isAuthenticated || !authToken) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Admin sign-in required</h1>
        <Link to="/admin" className="text-amber-600 hover:underline">
          Go to login
        </Link>
      </div>
    );
  }
  return <Outlet />;
}
