import { text } from "drizzle-orm/pg-core";
import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";


export const CategoryStatus = pgEnum('category_status', ['ACTIVE', 'INACTIVE']);

export type CategoryStatusEnum = (typeof CategoryStatus.enumValues)[number];


export const categories = pgTable('categories', {
   id: uuid('id').defaultRandom().primaryKey(),
   title: varchar('title', { length: 255 }).notNull(),
   status: CategoryStatus('status').default('ACTIVE'),
   image_url: text('image_url'),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

