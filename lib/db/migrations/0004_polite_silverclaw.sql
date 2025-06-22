CREATE TABLE "attribute_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_alternate_images" (
	"id" integer PRIMARY KEY DEFAULT nextval('product_alternate_images_id_seq') NOT NULL,
	"product_id" integer NOT NULL,
	"small_alt_picture" text,
	"medium_alt_picture" text,
	"large_alt_picture" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_variations" (
	"id" integer PRIMARY KEY DEFAULT nextval('product_variations_id_seq') NOT NULL,
	"product_id" integer NOT NULL,
	"sku_id" integer NOT NULL,
	"color" text NOT NULL,
	"attr1_alias" text NOT NULL,
	"hex" text,
	"size" text NOT NULL,
	"sub_size" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"color_image" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"type" text NOT NULL,
	"group" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "product_images" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "product_images" CASCADE;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT nextval('products_id_seq');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "style_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "style" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "quantity_available" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "on_sale" text DEFAULT 'N' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_new" text DEFAULT 'N' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "small_picture" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "medium_picture" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "large_picture" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "dept" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "typ" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "subtyp" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "selling_price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "regular_price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "of7" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "of12" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "of13" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "of15" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "force_buy_qty_limit" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "last_rcvd" text;--> statement-breakpoint
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_alternate_images" ADD CONSTRAINT "product_alternate_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_style_id_unique" UNIQUE("style_id");