CREATE SCHEMA "mercato";
--> statement-breakpoint
CREATE TABLE "mercato"."order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mercato"."orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mercato"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mercato"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "mercato"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mercato"."order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "mercato"."products"("id") ON DELETE no action ON UPDATE no action;