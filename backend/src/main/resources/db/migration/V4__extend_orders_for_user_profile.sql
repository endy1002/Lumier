ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_google_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shipping_address TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_customer_google_id ON orders(customer_google_id);
