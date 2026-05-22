import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
      <p className="mt-2 text-sm text-ink/60">Admin settings will appear here.</p>
    </div>
  );
}
