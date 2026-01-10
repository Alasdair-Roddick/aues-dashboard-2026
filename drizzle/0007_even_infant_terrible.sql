CREATE TABLE "user_customizations" (
	"userId" uuid NOT NULL,
	"primaryColor" text DEFAULT '#2563eb' NOT NULL,
	"secondaryColor" text DEFAULT '#10b981' NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	CONSTRAINT "user_customizations_userId_pk" PRIMARY KEY("userId")
);
--> statement-breakpoint
ALTER TABLE "user_customizations" ADD CONSTRAINT "user_customizations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;