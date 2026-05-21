import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Shell } from '../components/Shell';

export const Route = createFileRoute('/admin')({
  component: () => (
    <Shell>
      <Outlet />
    </Shell>
  ),
});
