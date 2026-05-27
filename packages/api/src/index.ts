import { Hono } from 'hono';
import { cors } from 'hono/cors';
import health from './routes/health';
import authRoutes from './routes/auth';
import catalogRoutes from './routes/catalog';
import checkoutRoutes from './routes/checkout';
import ordersRoutes from './routes/orders';

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

const port = Number(process.env.PORT) || 3001;

console.log(`@lotr/api running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
