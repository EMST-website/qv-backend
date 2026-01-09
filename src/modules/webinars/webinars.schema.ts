import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from '@/modules/users/users.schema';
import { relations } from 'drizzle-orm';

export const webinars = pgTable('webinars', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  endDate: timestamp('end_date'),
  platform: text('platform').notNull(), // Zoom, Google, etc.
  link: text('link'),
  capacity: integer('capacity'),
  bannerUrl: text('banner_url'),
  duration: integer('duration'),
  countryAvailability: text('country_availability').array(), // Stored as array of strings
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const webinarRegistrations = pgTable('webinar_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  webinarId: uuid('webinar_id')
    .references(() => webinars.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  registeredAt: timestamp('registered_at').defaultNow(),
});

export const webinarsRelations = relations(webinars, ({ many }) => ({
  registrations: many(webinarRegistrations),
}));

export const webinarRegistrationsRelations = relations(
  webinarRegistrations,
  ({ one }) => ({
    webinar: one(webinars, {
      fields: [webinarRegistrations.webinarId],
      references: [webinars.id],
    }),
    user: one(users, {
      fields: [webinarRegistrations.userId],
      references: [users.id],
    }),
  }),
);
