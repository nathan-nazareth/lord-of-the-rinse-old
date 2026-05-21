import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
  component: () => (
    <div className="p-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Admin Dashboard</h1>
    </div>
  ),
});
