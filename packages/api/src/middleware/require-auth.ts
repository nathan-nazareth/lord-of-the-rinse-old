import type { MiddlewareHandler } from 'hono';
import { auth } from '../lib/auth';

interface AuthUser {
  role?: string;
  [key: string]: unknown;
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const user = session.user as AuthUser;
  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden: admin access required' }, 403);
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
};
