import { pgEnum } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { cities as citiesSchema } from './cities.schema';
import { relations } from 'drizzle-orm';
import { users } from '@/modules/users/schema/users.schema';

export const CountryStatus = pgEnum('country_status', ['ACTIVE', 'INACTIVE']);

export type CountryStatusEnum = (typeof CountryStatus.enumValues)[number];

export const countries = pgTable('countries', {
   id: uuid('id').defaultRandom().primaryKey(),
   name: text('name').notNull().unique(),
   status: CountryStatus('status').default('ACTIVE'),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

// relations
export const countriesRelations = relations(countries, ({ many }) => ({
   cities: many(citiesSchema),
   users: many(users),
}));
