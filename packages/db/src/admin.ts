import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as adminSchema from './schema/admin-sqlite';

const adminDbUrl = process.env.ADMIN_SQLITE_URL || 'file:admin.db';

const adminClient = createClient({ url: adminDbUrl });
export const adminDb = drizzle(adminClient, { schema: adminSchema });

const shutdown = () => {
  try {
    adminClient.close();
  } catch (err) {
    console.error('Failed to close libsql client:', err);
  }
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

export { adminSchema, adminClient };
export const { adminProducts, adminOptions, adminDiscounts } = adminSchema;