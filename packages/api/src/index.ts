import { Hono } from 'hono';
import { cors } from 'hono/cors';
import health from './routes/health';
import authRoutes from './routes/auth';

export const app = new Hono();

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

const port = Number(process.env.PORT) || 3001;

console.log(`@lotr/api running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
