import { Hono } from 'hono';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';

const app = new Hono();

const adminAuth = (c: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.replace('Bearer ', '');
  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return c.json({ error: 'Invalid admin token' }, 401);
  }
};

app.use('*', adminAuth as any);

app.get('/', (c) => {
  return c.json({ id: 1, minPrice: 1, maxPrice: 100, minSize: 50, maxSize: 500, updatedAt: new Date().toISOString() });
});

app.put('/', (c) => {
  return c.json({ id: 1, minPrice: 1, maxPrice: 100, minSize: 50, maxSize: 500, updatedAt: new Date().toISOString() });
});

export default app;