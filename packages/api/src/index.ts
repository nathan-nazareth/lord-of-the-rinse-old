import { Hono } from 'hono';
import health from './routes/health';

export const app = new Hono();

app.route('/health', health);
app.route('/api/health', health);

const port = Number(process.env.PORT) || 3001;

console.log(`@lotr/api running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
