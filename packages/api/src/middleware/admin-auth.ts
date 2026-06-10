import type { MiddlewareHandler } from 'hono';
import { verifyAdminToken } from '../lib/auth-token';

const BEARER_PREFIX = 'Bearer ';

export const adminAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith(BEARER_PREFIX)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(BEARER_PREFIX.length).trim();
  if (token.length === 0) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const payload = verifyAdminToken(token);

  if (!payload) {
    return c.json({ error: 'Invalid or expired admin token' }, 401);
  }

  c.set('user', { id: payload.sub, role: 'admin' });
  await next();
};
