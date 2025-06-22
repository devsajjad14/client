ALTER TABLE "product_alternate_images" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "product_alternate_images" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "product_variations" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "product_variations" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "product_variations" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "product_variations" ADD COLUMN "barcode" text;--> statement-breakpoint
ALTER TABLE "product_variations" ADD COLUMN "available" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "url_handle" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "barcode" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku" text;