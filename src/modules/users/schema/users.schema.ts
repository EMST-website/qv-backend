import { pgEnum, pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { organizations } from '@/modules/organizations/schema/organizations.schema';

export const UserRoles = pgEnum('user_role', ['ADMIN', 'USER']);

export type UserRolesEnum = (typeof UserRoles.enumValues)[number];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  phone: text('phone'),
  country: text('country'),
  city: text('city'),
  organization_id: uuid('organization_id').references(() => organizations.id),
  role: UserRoles('role').default('USER'),
  is_active: boolean('is_active').default(false),
  activation_token: text('activation_token'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
