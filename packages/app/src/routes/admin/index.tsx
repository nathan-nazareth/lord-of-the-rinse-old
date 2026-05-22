import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-2 text-sm text-ink/60">Welcome to the admin panel.</p>
    </div>
  );
}
