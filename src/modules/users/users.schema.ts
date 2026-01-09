import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from '@/modules/organizations/organizations.schema';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  country: text('country'),
  city: text('city'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  role: userRoleEnum('role').default('USER'),
  isActive: boolean('is_active').default(false),
  newsletterSubscribed: boolean('newsletter_subscribed').default(true),
  activationToken: text('activation_token'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));
