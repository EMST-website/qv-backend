import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../users/schema/users.schema";

export const StoryStatus = pgEnum('story_status', ['PUBLISHED', 'UNPUBLISHED']);

export type StoryStatusEnum = (typeof StoryStatus.enumValues)[number];

// Stories table
export const stories = pgTable('stories', {
   id: uuid('id').defaultRandom().primaryKey(),
   details: text('details').notNull(),
   status: StoryStatus('status').notNull(),
   user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});

// Relations
export const storiesRelations = relations(stories, ({ one }) => ({
   user: one(users, {
      fields: [stories.user_id],
      references: [users.id],
   }),
}));
