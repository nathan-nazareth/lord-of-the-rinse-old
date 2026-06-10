import { timingSafeEqual } from 'node:crypto';
import { Hono } from 'hono';
import { signAdminToken } from '../lib/auth-token';
import { rateLimit } from '../middleware/rate-limit';

const MIN_PASSWORD_LENGTH = 16;

function getExpected(): Buffer {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    throw new Error('ADMIN_PASSWORD is required');
  }
  if (pwd.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  return Buffer.from(pwd, 'utf-8');
}

const adminAuthRoutes = new Hono();

adminAuthRoutes.post('/login', rateLimit({ windowMs: 60_000, max: 5 }), async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const password = (body as { password?: unknown })?.password;
  if (typeof password !== 'string' || password.length === 0) {
    return c.json({ error: 'Password is required' }, 400);
  }

  let expected: Buffer;
  try {
    expected = getExpected();
  } catch (err) {
    console.error('[admin-auth] misconfigured:', err);
    return c.json({ error: 'Admin login is not configured' }, 503);
  }

  const provided = Buffer.from(password, 'utf-8');
  const match = provided.length === expected.length && timingSafeEqual(provided, expected);
  if (!match) {
    return c.json({ error: 'Invalid password' }, 401);
  }

  return c.json({ token: signAdminToken('admin'), expiresIn: 60 * 60 * 8 });
});

export default adminAuthRoutes;
