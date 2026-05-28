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
  const body = c.req.json<{ percentage: number; description: string }>();
  return c.json({ id: 1, percentage: body.percentage, description: body.description, active: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, 201);
});

app.put('/:id', (c) => {
  const body = c.req.json<{ percentage?: number; description?: string; active?: number }>();
  return c.json({ id: Number(c.req.param('id')), percentage: body.percentage ?? 10, description: body.description ?? '', active: body.active ?? 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.delete('/:id', (c) => {
  return c.json({ success: true });
});

export default app;