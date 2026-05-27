import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as adminSchema from './schema/admin-sqlite';

const adminDbUrl = process.env.ADMIN_SQLITE_URL || 'file:admin.db';

const adminClient = createClient({ url: adminDbUrl });
export const adminDb = drizzle(adminClient, { schema: adminSchema });

export { adminSchema };
export const { adminProducts, adminOptions, adminDiscounts } = adminSchema;