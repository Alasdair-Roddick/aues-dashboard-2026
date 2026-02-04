CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"qpay_url" text,
	"qpay_email" text,
	"qpay_session_id" text,
	"squarespace_api_key" text,
	"squarespace_api_url" text,
	"squarespace_api_version" text,
	"pubcrawl_shirt_keyword" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
