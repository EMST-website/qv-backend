import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { webinars } from './webinars.schema';
import { users } from '@/modules/users/schema/users.schema';

export const webinarRegistrations = pgTable('webinar_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  webinar_id: uuid('webinar_id').notNull().references(() => webinars.id),
  user_id: uuid('user_id').notNull().references(() => users.id),
  registered_at: timestamp('registered_at').defaultNow(),
});
