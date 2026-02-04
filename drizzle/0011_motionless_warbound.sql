CREATE TABLE "squarespace_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"size" text,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "squarespace_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"fulfillment_status" text NOT NULL,
	"created_on" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "squarespace_order_items" ADD CONSTRAINT "squarespace_order_items_order_id_squarespace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."squarespace_orders"("id") ON DELETE cascade ON UPDATE no action;