import { cities } from '@/modules/countries/schema/cities.schema';
import { countries } from '@/modules/countries/schema/countries.schema';
import { organizations } from '@/modules/organizations/organizations.schema';
import { relations } from 'drizzle-orm';
import { integer } from 'drizzle-orm/pg-core';
import { varchar } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const UserGender = pgEnum('user_gender', ['MALE', 'FEMALE']);
export const UserStatus = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'PENDING']);

export type UserGenderEnum = (typeof UserGender.enumValues)[number];
export type UserStatusEnum = (typeof UserStatus.enumValues)[number];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  first_name: varchar('first_name', { length: 255 }),
  last_name: varchar('last_name', { length: 255 }),
  phone: varchar('phone', { length: 255 }),
  image_url: text('image_url'),
  gender: UserGender('gender'),
  date_of_birth: timestamp('date_of_birth'),
  reward_points: integer('reward_points').default(0),

  country_id: uuid('country_id')
    .references(() => countries.id, { onDelete: 'set null' }),
  city_id: uuid('city_id')
    .references(() => cities.id, { onDelete: 'set null' }),
  organization_id: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'set null' }),

  status: UserStatus('status').default('PENDING'),

  activation_token: text('activation_token'),
  is_profile_completed: boolean('is_profile_completed').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// relations
export const usersRelations = relations(users, ({ one }) => ({
  country: one(countries, {
    fields: [users.country_id],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [users.city_id],
    references: [cities.id],
  }),
  organization: one(organizations, {
    fields: [users.organization_id],
    references: [organizations.id],
  }),
}));
