-- ============================================================
-- GrocerApp - Supabase Database Schema
-- Run this ONCE in the Supabase SQL Editor
-- (Dashboard > SQL Editor > New query)
-- ============================================================

-- ===========================================================================
-- EXTENSIONS
-- ===========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ===========================================================================
-- TABLES
-- ===========================================================================

-- Profiles (extends auth.users with name + role)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'CLIENT'
                CHECK (role IN ('ADMIN', 'CLIENT')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image       TEXT,
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name        TEXT NOT NULL,
  user_email       TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED')),
  total_price      NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  delivery_address TEXT NOT NULL,
  delivery_city    TEXT NOT NULL,
  delivery_phone   TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items (snapshot of product at time of order)
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact messages (from the Contact Us page)
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ===========================================================================
-- INDEXES
-- ===========================================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name         ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON order_items(order_id);


-- ===========================================================================
-- TRIGGERS
-- ===========================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- ---------------------------------------------------------------------------
-- Profiles policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select"
  ON profiles FOR SELECT USING (is_admin());

-- ---------------------------------------------------------------------------
-- Categories policies (public read, admin write)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_public_read"  ON categories;
DROP POLICY IF EXISTS "categories_admin_write"  ON categories;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT USING (true);

CREATE POLICY "categories_admin_write"
  ON categories FOR ALL USING (is_admin());

-- ---------------------------------------------------------------------------
-- Products policies (public read, admin write)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_admin_write" ON products;

CREATE POLICY "products_public_read"
  ON products FOR SELECT USING (true);

CREATE POLICY "products_admin_write"
  ON products FOR ALL USING (is_admin());

-- ---------------------------------------------------------------------------
-- Orders policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "orders_user_select"   ON orders;
DROP POLICY IF EXISTS "orders_user_insert"   ON orders;
DROP POLICY IF EXISTS "orders_admin_select"  ON orders;
DROP POLICY IF EXISTS "orders_admin_update"  ON orders;

CREATE POLICY "orders_user_select"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_user_insert"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_admin_select"
  ON orders FOR SELECT USING (is_admin());

CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE USING (is_admin());

-- ---------------------------------------------------------------------------
-- Order items policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "order_items_user_select"  ON order_items;
DROP POLICY IF EXISTS "order_items_user_insert"  ON order_items;
DROP POLICY IF EXISTS "order_items_admin_select" ON order_items;

CREATE POLICY "order_items_user_select"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
  ));

CREATE POLICY "order_items_user_insert"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
  ));

CREATE POLICY "order_items_admin_select"
  ON order_items FOR SELECT USING (is_admin());

-- ---------------------------------------------------------------------------
-- Contact messages policies (anyone can insert, only admin can read)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "contact_messages_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_select" ON contact_messages;

CREATE POLICY "contact_messages_insert"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_select"
  ON contact_messages FOR SELECT USING (is_admin());


-- ===========================================================================
-- ADMIN USER SETUP
-- ===========================================================================
-- 1. Sign up through the app at /signup using your admin email.
-- 2. Then run this SQL to promote the account to ADMIN:
--
--   UPDATE profiles
--   SET role = 'ADMIN'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
--
-- After running schema.sql, run seed-catalog.sql to load the product catalog.
-- ===========================================================================
