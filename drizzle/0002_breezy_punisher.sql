ALTER TABLE "webinars" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "webinars" ADD COLUMN "is_active" boolean DEFAULT true;