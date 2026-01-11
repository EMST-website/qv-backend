import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const webinars = pgTable('webinars', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  platform: text('platform').notNull(),
  link: text('link'),
  capacity: integer('capacity'),
  banner_url: text('banner_url'),
  country_availability: text('country_availability').array(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
