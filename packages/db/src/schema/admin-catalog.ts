import { integer, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const products = pgTable('admin_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  basePrice: integer('base_price').notNull(),
  minWeight: integer('min_weight').notNull(),
  maxWeight: integer('max_weight').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const catalogOptions = pgTable('admin_catalog_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  hexValue: text('hex_value'),
  displayOrder: integer('display_order').default(0),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productOptions = pgTable('admin_product_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id),
  optionId: uuid('option_id').notNull().references(() => catalogOptions.id),
  extraPrice: integer('extra_price').default(0).notNull(),
});

export const discounts = pgTable('admin_discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(),
  value: integer('value').notNull(),
  minOrderValue: integer('min_order_value').default(0).notNull(),
  maxUses: integer('max_uses'),
  usesCount: integer('uses_count').default(0).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable('admin_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(),
  adminId: text('admin_id').notNull(),
  changes: text('changes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});