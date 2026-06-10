import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { adminAuth } from './middleware/admin-auth';
import { rateLimit } from './middleware/rate-limit';
import adminAuthRoutes from './routes/admin-auth';
import adminDiscountsRoutes from './routes/admin-discounts';
import adminOptionsRoutes from './routes/admin-options';
import adminProductsRoutes from './routes/admin-products';
import attributesRoutes from './routes/attributes';
import authRoutes from './routes/auth';
import catalogRoutes from './routes/catalog';
import checkoutRoutes from './routes/checkout';
import health from './routes/health';
import ordersRoutes from './routes/orders';
import productionQueueRoutes from './routes/production-queue';
import settingsRoutes from './routes/settings';
import stockMovementsRoutes from './routes/stock-movements';
import variantsRoutes from './routes/variants';

export const app = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

const isProduction = process.env.NODE_ENV === 'production';
const corsOrigin = process.env.CORS_ORIGIN;

if (isProduction && !corsOrigin) {
  throw new Error('CORS_ORIGIN is required in production');
}

app.use(
  '/api/*',
  cors({
    origin: corsOrigin || 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'Retry-After'],
    maxAge: 600,
    credentials: true,
  }),
);

app.use('/api/*', rateLimit({ windowMs: 60_000, max: 120 }));

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

// Login is public — it MUST be mounted BEFORE the global adminAuth middleware
// or the middleware (which matches `/api/admin/*`) would 401 the login
// request itself.
app.route('/api/admin/auth', adminAuthRoutes);

// Admin/operator routes — everything else under /api/admin/* and /api/orders/*
// requires a valid HMAC admin token.
app.use('/api/orders/*', adminAuth);
app.use('/api/admin/*', adminAuth);

app.route('/api/orders', ordersRoutes);
app.route('/api/admin/variants', variantsRoutes);
app.route('/api/admin/stock-movements', stockMovementsRoutes);
app.route('/api/admin/production-queue', productionQueueRoutes);
app.route('/api/admin/attributes', attributesRoutes);
app.route('/api/admin/products', adminProductsRoutes);
app.route('/api/admin/options', adminOptionsRoutes);
app.route('/api/admin/discounts', adminDiscountsRoutes);
app.route('/api/admin/settings', settingsRoutes);

const port = Number(process.env.PORT) || 3001;

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const { serve } = await import('@hono/node-server');
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`@lotr/api running on http://localhost:${info.port}`);
  });
}

export default app;
