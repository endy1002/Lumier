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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
