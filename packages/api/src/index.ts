import { Hono } from 'hono';
import { cors } from 'hono/cors';
import health from './routes/health';
import authRoutes from './routes/auth';
import catalogRoutes from './routes/catalog';
import attributesRoutes from './routes/attributes';
import variantsRoutes from './routes/variants';
import settingsRoutes from './routes/settings';
import stockMovementsRoutes from './routes/stock-movements';
import checkoutRoutes from './routes/checkout';
import ordersRoutes from './routes/orders';
import productionQueueRoutes from './routes/production-queue';
import { requireAuth } from './middleware/require-auth';

export const app = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'PATCH', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);

app.onError((err, c) => {
  console.error('Unhandled error:', err);

  if (err instanceof SyntaxError) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  return c.json({ error: 'Internal server error' }, 500);
});

app.route('/health', health);
app.route('/api/health', health);
app.route('/api/catalog', catalogRoutes);
app.route('/api/checkout', checkoutRoutes);
app.route('/api/auth', authRoutes);

app.use('/api/admin/*', requireAuth);
app.get('/api/admin/session', (c) => {
  const user = c.get('user');
  return c.json({ user });
});
app.route('/api/admin/settings', settingsRoutes);
app.route('/api/admin/attributes', attributesRoutes);
app.route('/api/admin/variants', variantsRoutes);
app.route('/api/admin/stock-movements', stockMovementsRoutes);
app.route('/api/admin/orders', ordersRoutes);
app.route('/api/admin/production-queue', productionQueueRoutes);

const port = Number(process.env.PORT) || 3001;

console.log(`@lotr/api running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
