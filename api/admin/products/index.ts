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
  return c.json([]);
});

app.post('/', (c) => {
  return c.json({ id: 1, name: 'Test', color: 'blue', scent: 'lavender', shape: 'round', weight: 100, price: 9.99, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, 201);
});

app.delete('/:id', (c) => {
  return c.json({ success: true });
});

export default app;