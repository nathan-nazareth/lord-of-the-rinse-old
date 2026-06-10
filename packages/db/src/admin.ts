import { mkdirSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as adminSchema from './schema/admin-sqlite';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const adminDbUrl = process.env.ADMIN_SQLITE_URL;

if (!adminDbUrl) {
  if (isProduction) {
    throw new Error('ADMIN_SQLITE_URL is required in production');
  }
  if (isTest) {
    // Tests open against a unique per-process file so concurrent workers
    // do not clobber one another. The path is consumed below.
  }
}

const resolvedAdminDbUrl =
  adminDbUrl ??
  (isTest
    ? (() => {
        // Bun's libsql binding refuses to create the parent directory,
        // so the .tmp/ folder must pre-exist when running tests.
        const dir = `${process.cwd()}/.tmp`;
        try {
          mkdirSync(dir, { recursive: true });
        } catch {
          // best-effort
        }
        return `file:${dir}/admin-${process.pid}-${Date.now()}.db`;
      })()
    : 'file:admin.db');

const adminClient = createClient({ url: resolvedAdminDbUrl });
export const adminDb = drizzle(adminClient, { schema: adminSchema });

let adminClientClosed = false;
const shutdown = () => {
  if (adminClientClosed) return;
  adminClientClosed = true;
  try {
    adminClient.close();
  } catch (err) {
    console.error('Failed to close libsql client:', err);
  }
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
process.once('beforeExit', shutdown);

export { adminSchema, adminClient };
export const { adminProducts, adminOptions, adminDiscounts } = adminSchema;