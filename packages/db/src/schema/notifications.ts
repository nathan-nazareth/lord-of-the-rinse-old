import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const notificationAttempts = pgTable('notification_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  provider: text('provider').notNull(), // web3forms
  status: text('status').notNull().default('pending'), // pending, sent, failed
  attempts: integer('attempts').default(0).notNull(),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
