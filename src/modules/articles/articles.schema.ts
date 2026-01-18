import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const ArticleFileType = pgEnum('article_file_type', ['IMG', 'VIDEO']);
export const ArticleStatus = pgEnum('article_status', ['DRAFT', 'PUBLISHED', 'UNPUBLISHED']);

export type ArticleFileTypeEnum = (typeof ArticleFileType.enumValues)[number];
export type ArticleStatusEnum = (typeof ArticleStatus.enumValues)[number];

// Articles table
export const articles = pgTable('articles', {
   id: uuid('id').defaultRandom().primaryKey(),
   title: varchar('title', { length: 255 }).notNull(),
   description: text('description').notNull(),
   file_url: text('file_url'),
   file_type: ArticleFileType('file_type'),
   status: ArticleStatus('status').notNull(),
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow(),
});
