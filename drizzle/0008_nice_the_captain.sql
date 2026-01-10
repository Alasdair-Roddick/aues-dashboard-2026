ALTER TABLE "user_customizations" RENAME COLUMN "primaryColor" TO "lightPrimaryColor";--> statement-breakpoint
ALTER TABLE "user_customizations" ADD COLUMN "lightSecondaryColor" text DEFAULT '#10b981' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_customizations" ADD COLUMN "darkPrimaryColor" text DEFAULT '#3b82f6' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_customizations" ADD COLUMN "darkSecondaryColor" text DEFAULT '#22c55e' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_customizations" DROP COLUMN "secondaryColor";