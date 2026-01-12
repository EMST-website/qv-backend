import { pgTable, uuid, text, pgEnum } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { countries } from './countries.schema';
import { relations } from 'drizzle-orm';
import { users } from '@/modules/users/schema/users.schema';

export const CityStatus = pgEnum('city_status', ['ACTIVE', 'INACTIVE']);

export type CityStatusEnum = (typeof CityStatus.enumValues)[number];

export const cities = pgTable('cities', {
   id: uuid('id').defaultRandom().primaryKey(),
   name: text('name').notNull().unique(),
   country_id: uuid('country_id')
      .references(() => countries.id, { onDelete: 'cascade' })
      .notNull(),
   status: CityStatus('status').default('ACTIVE'),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

// relations
export const citiesRelations = relations(cities, ({ one, many }) => ({
   country: one(countries, {
      fields: [cities.country_id],
      references: [countries.id],
   }),
   users: many(users),
}));
