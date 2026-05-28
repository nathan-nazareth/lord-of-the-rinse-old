import { Hono } from 'hono';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';

const app = new Hono();

app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

app.options('/', (c) => {
  return c.text('', 204);
});

app.post('/', (c) => {
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