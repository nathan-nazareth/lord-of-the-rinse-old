import { Hono } from 'hono';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';

const app = new Hono();

app.post('/login', (c) => {
  const { password } = c.req.json<{ password?: string }>();

  if (!password) {
    return c.json({ error: 'Password is required' }, 400);
  }

  if (password !== ADMIN_PASSWORD) {
    return c.json({ error: 'Invalid password' }, 401);
  }

  return c.json({ token: `admin-${ADMIN_PASSWORD}` });
});

export default app;