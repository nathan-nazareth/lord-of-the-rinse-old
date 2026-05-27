import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/options')({
  component: AdminOptions,
});

function AdminOptions() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Options Management</h1>
      <p className="text-stone-600">Manage scents, colors, and shapes.</p>
    </div>
  );
}