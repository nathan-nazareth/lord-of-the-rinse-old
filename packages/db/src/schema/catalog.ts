import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const catalogAttributes = pgTable('catalog_attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(), // shape, scent, color, size, addon
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  displayOrder: integer('display_order').default(0),
  archived: boolean('archived').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const soapVariants = pgTable('soap_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  unitPrice: text('unit_price').notNull(), // stored as decimal string
  enabled: boolean('enabled').default(true).notNull(),
  archived: boolean('archived').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const variantAttributes = pgTable('variant_attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => soapVariants.id),
  attributeId: uuid('attribute_id')
    .notNull()
    .references(() => catalogAttributes.id),
  value: text('value').notNull(),
});
