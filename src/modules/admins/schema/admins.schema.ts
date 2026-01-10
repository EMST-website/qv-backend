import { pgEnum, varchar } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const AdminRoles = pgEnum('admin_roles', ['SUPER_ADMIN', 'ADMIN']);

export type AdminRolesEnum = (typeof AdminRoles.enumValues)[number];

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 255 }).notNull(),
  last_name: varchar('last_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 255 }).unique(),
  country: varchar('country', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  role: AdminRoles('role').default('ADMIN'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
