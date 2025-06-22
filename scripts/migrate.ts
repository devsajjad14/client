import { db } from '../lib/db'
import { up as initialSettingsUp } from '../lib/db/migrations/0001_initial_settings'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    console.log('Running migrations...')
    
    // Run initial settings migration
    console.log('Running initial settings migration...')
    await initialSettingsUp(db)
    
    // Create orders tables
    console.log('Creating orders tables...')
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "orders" (
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

      CREATE TABLE IF NOT EXISTS "order_items" (
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
    `)
    
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
