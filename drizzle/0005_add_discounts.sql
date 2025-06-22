CREATE TABLE IF NOT EXISTS "discounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "description" text,
  "type" text NOT NULL,
  "value" decimal(10,2) NOT NULL,
  "min_purchase_amount" decimal(10,2),
  "max_discount_amount" decimal(10,2),
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "usage_limit" integer,
  "usage_count" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
); 