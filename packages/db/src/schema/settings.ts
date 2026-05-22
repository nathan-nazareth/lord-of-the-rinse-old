import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const commerceSettings = pgTable('commerce_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(), // JSON string for complex values
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
