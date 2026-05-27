import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/admin-sqlite.ts',
  out: './drizzle-admin',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.ADMIN_SQLITE_URL || 'file:admin.db',
  },
});