import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@lotr/shared/schemas',
        replacement: path.resolve(__dirname, '../shared/src/schemas/index.ts'),
      },
      { find: '@lotr/shared', replacement: path.resolve(__dirname, '../shared/src/index.ts') },
      {
        find: '@lotr/db/schema',
        replacement: path.resolve(__dirname, '../db/src/schema/index.ts'),
      },
      { find: '@lotr/db/admin', replacement: path.resolve(__dirname, '../db/src/admin.ts') },
      { find: '@lotr/db', replacement: path.resolve(__dirname, '../db/src/index.ts') },
    ],
  },
  test: {
    globals: true,
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      ADMIN_TOKEN_SECRET: 'test-secret-do-not-use-in-prod-must-be-32-chars',
      ADMIN_PASSWORD: 'testpassword123',
    },
  },
});
