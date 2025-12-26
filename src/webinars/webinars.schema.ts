import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from '../users/users.schema';

export const webinars = pgTable('webinars', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  platform: text('platform').notNull(), // Zoom, Google, etc.
  link: text('link'),
  capacity: integer('capacity'),
  bannerUrl: text('banner_url'),
  countryAvailability: text('country_availability').array(), // Stored as array of strings
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const webinarRegistrations = pgTable('webinar_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  webinarId: uuid('webinar_id').references(() => webinars.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  registeredAt: timestamp('registered_at').defaultNow(),
});
