-- Drop and recreate the products table with the correct schema
DROP TABLE IF EXISTS product_alternate_images CASCADE;
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Create the products table with all required fields
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    style_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    style TEXT NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    on_sale TEXT NOT NULL DEFAULT 'N',
    is_new TEXT NOT NULL DEFAULT 'N',
    small_picture TEXT,
    medium_picture TEXT,
    large_picture TEXT,
    dept TEXT,
    typ TEXT,
    subtyp TEXT,
    brand TEXT,
    selling_price INTEGER NOT NULL,
    regular_price INTEGER NOT NULL,
    long_description TEXT,
    of7 TEXT,
    of12 TEXT,
    of13 TEXT,
    of15 TEXT,
    force_buy_qty_limit TEXT,
    last_rcvd TEXT,
    tags TEXT,
    url_handle TEXT,
    barcode TEXT,
    sku TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the product_variations table
CREATE TABLE product_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku_id INTEGER NOT NULL,
    color TEXT NOT NULL,
    attr1_alias TEXT NOT NULL,
    hex TEXT,
    size TEXT NOT NULL,
    sub_size TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    color_image TEXT,
    sku TEXT,
    barcode TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the product_alternate_images table
CREATE TABLE product_alternate_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    AltImage TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 