import { cities, countries } from "@/database/schema";
import { relations } from "drizzle-orm";
import { pgEnum, uuid } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "../users/schema/users.schema";

export const OrganizationStatus = pgEnum('organization_status', ['ACTIVE', 'INACTIVE']);

export type OrganizationStatusEnum = (typeof OrganizationStatus.enumValues)[number];


export const organizations = pgTable('organizations', {
   id: uuid('id').defaultRandom().primaryKey(),
   name: varchar('name', { length: 255 }).notNull(),
   status: OrganizationStatus('status').default('ACTIVE'),

   country_id: uuid('country_id')
      .references(() => countries.id, { onDelete: 'set null' }),
   city_id: uuid('city_id')
      .references(() => cities.id, { onDelete: 'set null' }),

   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

// relations
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
   country: one(countries, {
      fields: [organizations.country_id],
      references: [countries.id],
   }),
   city: one(cities, {
      fields: [organizations.city_id],
      references: [cities.id],
   }),
   users: many(users),
}));
