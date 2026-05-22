import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Shell } from '../components/Shell';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/get-session`, {
        credentials: 'include',
      });
      const data = await res.json();
      const user = data?.data?.user;
      const session = data?.data?.session;

      if (!session) {
        throw redirect({ to: '/admin/login', search: { redirect: location.href } });
      }

      if (user?.role !== 'admin') {
        throw redirect({ to: '/' });
      }
    } catch (e) {
      if ((e as { redirect?: unknown }).redirect) throw e;
      throw redirect({ to: '/admin/login', search: { redirect: location.href } });
    }
  },
  component: () => (
    <Shell>
      <Outlet />
    </Shell>
  ),
});
