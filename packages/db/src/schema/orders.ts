import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { soapVariants } from './catalog';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  reference: text('reference').notNull().unique(), // LOR-YYYYMMDD-NNNN
  status: text('status').notNull().default('new'), // new, processing, fulfilled, cancelled
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  total: text('total').notNull(), // stored as decimal string
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderLines = pgTable('order_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  variantId: uuid('variant_id').references(() => soapVariants.id),
  displayName: text('display_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: text('unit_price').notNull(),
  allocatedFromStock: integer('allocated_from_stock').default(0).notNull(),
  quantityToProduce: integer('quantity_to_produce').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
