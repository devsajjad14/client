-- Update product_alternate_images table to use new schema
-- Add new columns for different image sizes
ALTER TABLE "product_alternate_images" 
ADD COLUMN "small_alt_picture" text,
ADD COLUMN "medium_alt_picture" text,
ADD COLUMN "large_alt_picture" text;

-- Drop the old AltImage column if it exists
ALTER TABLE "product_alternate_images" 
DROP COLUMN IF EXISTS "AltImage"; 