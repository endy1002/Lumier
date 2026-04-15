-- Support environments that were baselined at V5 but don't actually have V1-V5 objects yet.
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL,
  base_price NUMERIC(12, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  customer_google_id VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(64) NOT NULL,
  shipping_address TEXT,
  total_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(32) NOT NULL,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  item_subtotal NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customizations (
  id BIGSERIAL PRIMARY KEY,
  order_item_id BIGINT NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  uploaded_cover_url TEXT,
  spine_color_hex VARCHAR(32),
  engraved_text VARCHAR(255),
  hardware_type VARCHAR(32),
  has_extra_chain BOOLEAN
);

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  cart_snapshot_json TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  google_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  picture TEXT,
  phone VARCHAR(64),
  shipping_address TEXT,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON abandoned_carts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_google_id ON orders(customer_google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO products (id, name, category, base_price, image_url, is_available)
VALUES
  (1, 'Tren doi mo mat va mo', 'CHARM', 100000, '/showing/cover/A1.jpg', TRUE),
  (2, 'The Other Side', 'CHARM', 100000, '/showing/cover/A2.jpg', TRUE),
  (3, 'Takahashi', 'CHARM', 100000, '/showing/cover/A3.jpg', TRUE),
  (4, 'Ngon den khong tat', 'CHARM', 100000, '/showing/cover/A4.jpg', TRUE),
  (5, 'Golden Book Charms Bookmark', 'BOOKMARK', 50000, '/showing/bookmark/D1.jpg', TRUE),
  (6, 'Artistic Bookmarks Set', 'BOOKMARK', 50000, '/showing/bookmark/D2.jpg', TRUE),
  (7, 'Lumier Classic Notebook', 'NOTEBOOK', 85000, '/showing/notes/B1.jpg', TRUE),
  (8, 'The Storyteller Journal', 'NOTEBOOK', 95000, '/showing/notes/B2.jpg', TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

SELECT setval('products_id_seq', GREATEST((SELECT MAX(id) FROM products), 1));

UPDATE products
SET image_url = CASE id
  WHEN 1 THEN '/showing/cover/A1.jpg'
  WHEN 2 THEN '/showing/cover/A2.jpg'
  WHEN 3 THEN '/showing/cover/A3.jpg'
  WHEN 4 THEN '/showing/cover/A4.jpg'
  WHEN 5 THEN '/showing/bookmark/D1.jpg'
  WHEN 6 THEN '/showing/bookmark/D2.jpg'
  WHEN 7 THEN '/showing/notes/B1.jpg'
  WHEN 8 THEN '/showing/notes/B2.jpg'
  ELSE image_url
END
WHERE image_url IS NULL OR image_url = '';
