import { createFileRoute, Link } from '@tanstack/react-router';
import { useAdminStore } from '@/stores/useAdminStore';

export const Route = createFileRoute('/admin/_index')({
  component: AdminIndex,
});

function AdminIndex() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const clearAuth = useAdminStore((s) => s.clearAuth);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Admin Login</h1>
          <p className="text-stone-600 mb-4">Please log in to access the admin dashboard.</p>
          <Link to="/admin" className="text-amber-600 hover:text-amber-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-stone-800">Admin</h1>
            <button
              type="button"
              onClick={() => clearAuth()}
              className="text-sm text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md hover:bg-stone-100"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Logged in!</h2>
          <p className="text-stone-600">Welcome to the admin dashboard.</p>
        </div>
      </main>
    </div>
  );
}
