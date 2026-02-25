CREATE TABLE "ausa_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"exported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"member_count" integer NOT NULL,
	"exported_by_user_id" uuid,
	"exported_by_user_name" text
);
--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "last_order_sync_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "last_member_sync_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ausa_exports" ADD CONSTRAINT "ausa_exports_exported_by_user_id_users_id_fk" FOREIGN KEY ("exported_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_created_at_idx" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_log_user_id_idx" ON "activity_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_log_entity_idx" ON "activity_log" USING btree ("entity_type","entity_id");