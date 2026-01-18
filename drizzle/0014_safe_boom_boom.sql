CREATE TYPE "public"."article_file_type" AS ENUM('IMG', 'VIDEO');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('DRAFT', 'PUBLISHED', 'UNPUBLISHED');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"file_url" text,
	"file_type" "article_file_type",
	"status" "article_status" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
