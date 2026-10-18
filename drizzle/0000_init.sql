CREATE TABLE "actions" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"site_id" text NOT NULL,
	"finding_id" text NOT NULL,
	"title" text NOT NULL,
	"assignee_id" text NOT NULL,
	"due_on" text NOT NULL,
	"status" text NOT NULL,
	"closed_on" text,
	"note" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crew" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"site_id" text,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"trade" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"site_id" text NOT NULL,
	"walk_id" text,
	"log_date" text NOT NULL,
	"summary" text NOT NULL,
	"crew_on_site" integer NOT NULL,
	"weather" text NOT NULL,
	"narrative" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "findings" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"site_id" text NOT NULL,
	"walk_id" text NOT NULL,
	"photo_id" text,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"bounding_description" text NOT NULL,
	"osha_category" text NOT NULL,
	"status" text NOT NULL,
	"sample" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"walk_id" text NOT NULL,
	"url" text NOT NULL,
	"storage" text NOT NULL,
	"caption" text NOT NULL,
	"media_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"phase" text NOT NULL,
	"status" text NOT NULL,
	"started_on" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "walks" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"site_id" text NOT NULL,
	"walked_on" text NOT NULL,
	"conducted_by" text NOT NULL,
	"weather" text NOT NULL,
	"crew_count" integer NOT NULL,
	"notes" text NOT NULL,
	"summary" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "actions_org_site_idx" ON "actions" USING btree ("org_id","site_id");--> statement-breakpoint
CREATE INDEX "crew_org_idx" ON "crew" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "logs_org_site_idx" ON "daily_logs" USING btree ("org_id","site_id");--> statement-breakpoint
CREATE INDEX "findings_org_site_idx" ON "findings" USING btree ("org_id","site_id");--> statement-breakpoint
CREATE INDEX "photos_walk_idx" ON "photos" USING btree ("walk_id");--> statement-breakpoint
CREATE INDEX "sites_org_idx" ON "sites" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sites_org_slug_idx" ON "sites" USING btree ("org_id","slug");--> statement-breakpoint
CREATE INDEX "walks_org_site_idx" ON "walks" USING btree ("org_id","site_id");