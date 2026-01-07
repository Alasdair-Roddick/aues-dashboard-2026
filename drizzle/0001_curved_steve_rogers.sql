CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"fullname" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phonenumber" varchar(64),
	"membership_id" varchar(50),
	"membership_type" varchar(50),
	"price_paid" numeric(8, 2),
	"payment_method" varchar(50),
	"is_valid" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "members_email_unique" UNIQUE("email"),
	CONSTRAINT "members_membership_id_unique" UNIQUE("membership_id")
);
--> statement-breakpoint
CREATE TABLE "membership_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"amount" numeric(8, 2),
	"method" varchar(50),
	"status" varchar(50) DEFAULT 'pending',
	"transaction_id" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "membership_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"responses" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "membership_payments" ADD CONSTRAINT "membership_payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_responses" ADD CONSTRAINT "membership_responses_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;