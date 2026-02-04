ALTER TABLE "squarespace_orders" ADD COLUMN "order_number" text;--> statement-breakpoint
ALTER TABLE "squarespace_orders" ADD COLUMN "shipping_status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "squarespace_orders" ADD COLUMN "shipping_tracking_number" text;--> statement-breakpoint
ALTER TABLE "squarespace_orders" ADD COLUMN "shipping_carrier" text DEFAULT 'auspost';--> statement-breakpoint
ALTER TABLE "squarespace_orders" ADD COLUMN "shipped_at" timestamp with time zone;