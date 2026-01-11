import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';
import { admins } from './admins.schema';

export const adminSessions = pgTable('admins_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  admin_id: uuid('admin_id')
    .references(() => admins.id, { onDelete: 'cascade' })
    .notNull(),
  otp: varchar('otp').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
