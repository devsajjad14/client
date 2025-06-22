CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "guest_email" text,
  "status" text NOT NULL DEFAULT 'pending',
  "payment_status" text NOT NULL DEFAULT 'pending',
  "total_amount" integer NOT NULL,
  "subtotal" integer NOT NULL,
  "tax" integer DEFAULT 0,
  "shipping_fee" integer DEFAULT 0,
  "discount" integer DEFAULT 0,
  "payment_method" text,
  "shipping_address_id" uuid REFERENCES "addresses"("id") ON DELETE SET NULL,
  "billing_address_id" uuid REFERENCES "addresses"("id") ON DELETE SET NULL,
  "note" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
  "variation_id" integer REFERENCES "product_variations"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "sku" text,
  "color" text,
  "size" text,
  "quantity" integer NOT NULL DEFAULT 1,
  "unit_price" integer NOT NULL,
  "total_price" integer NOT NULL,
  "created_at" timestamp DEFAULT now()
); 