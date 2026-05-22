import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
});

function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment">
      <div className="w-full max-w-sm rounded-lg border border-ink/10 bg-white p-8">
        <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Admin Login</h1>
        <p className="text-sm text-ink/60">
          Authentication required. Please sign in to access the admin dashboard.
        </p>
        <p className="mt-4 text-xs text-ink/40">
          Login functionality will be added in a future issue.
        </p>
      </div>
    </div>
  );
}
