CREATE INDEX "sq_order_items_order_id_idx" ON "squarespace_order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "sq_order_items_product_name_idx" ON "squarespace_order_items" USING btree ("product_name");--> statement-breakpoint
CREATE INDEX "sq_order_items_size_idx" ON "squarespace_order_items" USING btree ("size");--> statement-breakpoint
CREATE INDEX "sq_orders_status_created_idx" ON "squarespace_orders" USING btree ("fulfillment_status","created_on");--> statement-breakpoint
CREATE INDEX "sq_orders_order_number_idx" ON "squarespace_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "sq_orders_customer_email_idx" ON "squarespace_orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "sq_orders_customer_name_idx" ON "squarespace_orders" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "sq_orders_synced_at_idx" ON "squarespace_orders" USING btree ("synced_at");