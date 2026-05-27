import { createFileRoute, Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useAdminStore } from '@/stores/useAdminStore.ts';
import { LoginForm } from '@/components/admin/LoginForm.tsx';
import { useEffect } from 'react';

export const Route = createFileRoute('/admin/_index')({
  component: AdminWrapper,
});

function AdminWrapper() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const clearAuth = useAdminStore((s) => s.clearAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/admin' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-stone-800">Admin</h1>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                onClick={() => clearAuth()}
                className="text-sm text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md hover:bg-stone-100"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/products"
                className="text-sm text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md hover:bg-stone-100"
              >
                Products
              </Link>
              <Link
                to="/admin/options"
                className="text-sm text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md hover:bg-stone-100"
              >
                Options
              </Link>
              <Link
                to="/admin/discounts"
                className="text-sm text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md hover:bg-stone-100"
              >
                Discounts
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminIndex() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Admin Dashboard</h1>
      <p className="text-stone-600">Welcome to the admin section. Select a section from the navigation above.</p>
    </div>
  );
}