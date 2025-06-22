-- Update orders table monetary fields
ALTER TABLE orders
ALTER COLUMN total_amount TYPE decimal(10,2) USING total_amount::decimal,
ALTER COLUMN subtotal TYPE decimal(10,2) USING subtotal::decimal,
ALTER COLUMN tax TYPE decimal(10,2) USING tax::decimal,
ALTER COLUMN shipping_fee TYPE decimal(10,2) USING shipping_fee::decimal,
ALTER COLUMN discount TYPE decimal(10,2) USING discount::decimal;

-- Update order_items table monetary fields
ALTER TABLE order_items
ALTER COLUMN unit_price TYPE decimal(10,2) USING unit_price::decimal,
ALTER COLUMN total_price TYPE decimal(10,2) USING total_price::decimal; 