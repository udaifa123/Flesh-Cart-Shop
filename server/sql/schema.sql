-- FreshCart schema (PostgreSQL). Safe to run more than once.

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  full_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  password_hash   TEXT         NOT NULL,
  role            VARCHAR(10)  NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  failed_attempts INT          NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120)  NOT NULL UNIQUE,
  price      NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock      INT           NOT NULL CHECK (stock >= 0),
  emoji      VARCHAR(8)    NOT NULL DEFAULT '🛒',
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS bill_number_seq START 1001;

CREATE TABLE IF NOT EXISTS bills (
  id             SERIAL PRIMARY KEY,
  bill_number    VARCHAR(30)   NOT NULL UNIQUE,
  customer_name  VARCHAR(100),
  customer_phone VARCHAR(20),
  subtotal       NUMERIC(12,2) NOT NULL,
  gst_amount     NUMERIC(12,2) NOT NULL,
  grand_total    NUMERIC(12,2) NOT NULL,
  created_by     INT REFERENCES users(id),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bills_created_at_idx ON bills (created_at DESC);

CREATE TABLE IF NOT EXISTS bill_items (
  id           SERIAL PRIMARY KEY,
  bill_id      INT           NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  product_id   INT           NOT NULL REFERENCES products(id),
  product_name VARCHAR(120)  NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL,
  quantity     INT           NOT NULL CHECK (quantity > 0),
  line_total   NUMERIC(12,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS bill_items_bill_idx ON bill_items (bill_id);
