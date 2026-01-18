import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { categories } from "../categories/categories.schema";

export const ProductStatus = pgEnum('product_status', ['ACTIVE', 'INACTIVE']);

export type ProductStatusEnum = (typeof ProductStatus.enumValues)[number];

// Products table
export const products = pgTable('products', {
   id: uuid('id').defaultRandom().primaryKey(),
   title: varchar('title', { length: 255 }).notNull(),
   description: text('description'),
   status: ProductStatus('status').default('ACTIVE'),
   image_url: text('image_url'),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

// Product details table (one-to-many with products)
export const productDetails = pgTable('product_details', {
   id: uuid('id').defaultRandom().primaryKey(),
   product_id: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
   label: varchar('label', { length: 255 }).notNull(),
   value: text('value').notNull(),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

// Products-Categories junction table (many-to-many)
export const productsToCategories = pgTable('products_to_categories', {
   id: uuid('id').defaultRandom().primaryKey(),
   product_id: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
   category_id: uuid('category_id')
      .references(() => categories.id, { onDelete: 'cascade' })
      .notNull(),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
   details: many(productDetails),
   productsToCategories: many(productsToCategories),
}));

export const productDetailsRelations = relations(productDetails, ({ one }) => ({
   product: one(products, {
      fields: [productDetails.product_id],
      references: [products.id],
   }),
}));

export const productsToCategoriesRelations = relations(productsToCategories, ({ one }) => ({
   product: one(products, {
      fields: [productsToCategories.product_id],
      references: [products.id],
   }),
   category: one(categories, {
      fields: [productsToCategories.category_id],
      references: [categories.id],
   }),
}));
