import { Hono } from 'hono';
import { auth } from '../lib/auth';

const authRoutes = new Hono();

authRoutes.on(['POST', 'GET'], '/*', async (c) => {
  try {
    return await auth.handler(c.req.raw);
  } catch (err) {
    console.error('[auth] better-auth handler threw:', err);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

export default authRoutes;
