-- Update price columns to decimal type
ALTER TABLE products 
  ALTER COLUMN selling_price TYPE DECIMAL(10,2) USING selling_price::DECIMAL(10,2),
  ALTER COLUMN regular_price TYPE DECIMAL(10,2) USING regular_price::DECIMAL(10,2); 