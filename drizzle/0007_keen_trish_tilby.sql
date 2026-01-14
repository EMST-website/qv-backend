ALTER TABLE "users" ADD COLUMN "image_url" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_profile_completed" boolean DEFAULT false;