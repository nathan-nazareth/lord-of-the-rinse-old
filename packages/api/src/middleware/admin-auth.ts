import type { MiddlewareHandler } from 'hono';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';

export const adminAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return c.json({ error: 'Invalid admin token' }, 401);
  }

  await next();
};