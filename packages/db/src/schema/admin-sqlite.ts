import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const adminProducts = sqliteTable('admin_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  scent: text('scent').notNull(),
  shape: text('shape').notNull(),
  weight: integer('weight').notNull(),
  price: integer('price').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const adminOptions = sqliteTable('admin_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  minPrice: integer('min_price').notNull(),
  maxPrice: integer('max_price').notNull(),
  minSize: integer('min_size').notNull(),
  maxSize: integer('max_size').notNull(),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const adminDiscounts = sqliteTable('admin_discounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  percentage: integer('percentage').notNull(),
  description: text('description').notNull(),
  active: integer('active').notNull().default(1),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});