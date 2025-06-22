-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tags text,
ADD COLUMN IF NOT EXISTS url_handle text,
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS sku text;

-- Add new columns to product_variations table
ALTER TABLE product_variations
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS barcode text; 