import { Hono } from 'hono';
import { cors } from 'hono/cors';
import health from './routes/health';
import authRoutes from './routes/auth';
import { requireAuth } from './middleware/require-auth';

export const app = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

app.use(
  '/api/auth/*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);

app.route('/health', health);
app.route('/api/health', health);
app.route('/api/auth', authRoutes);

app.use('/api/admin/*', requireAuth);
app.get('/api/admin/session', (c) => {
  const user = c.get('user');
  return c.json({ user });
});

const port = Number(process.env.PORT) || 3001;

console.log(`@lotr/api running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
