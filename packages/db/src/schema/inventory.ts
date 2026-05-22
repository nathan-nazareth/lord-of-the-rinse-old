import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { soapVariants } from './catalog';

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => soapVariants.id),
  type: text('type').notNull(), // adjustment, allocation, cancellation_restock, production
  quantity: integer('quantity').notNull(), // positive for in, negative for out
  reason: text('reason'),
  referenceId: uuid('reference_id'), // links to order or other entity
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
