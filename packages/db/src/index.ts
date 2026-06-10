import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(connectionString, { max: 10, idle_timeout: 20 });

const shutdown = () => {
  client.end({ timeout: 5 }).catch((err) => {
    console.error('Failed to close postgres client:', err);
  });
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

export const db = drizzle(client, { schema });

export { sql, client };
