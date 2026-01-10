import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { admins } from './admins.schema';

export const adminRefreshTokens = pgTable('admins_refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  admin_id: uuid('admin_id')
    .references(() => admins.id)
    .notNull(),
  refresh_token: text('refresh_token').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
