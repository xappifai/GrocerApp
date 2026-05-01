-- ============================================================
-- GrocerApp — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Tables ───────────────────────────────────────────────────────────────────

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

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category_id  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name         ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON order_items(order_id);

-- ── Triggers ─────────────────────────────────────────────────────────────────

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

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select"
  ON profiles FOR SELECT USING (is_admin());

-- Categories policies (public read, admin write)
DROP POLICY IF EXISTS "categories_public_read"  ON categories;
DROP POLICY IF EXISTS "categories_admin_write"  ON categories;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT USING (true);

CREATE POLICY "categories_admin_write"
  ON categories FOR ALL USING (is_admin());

-- Products policies (public read, admin write)
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_admin_write" ON products;

CREATE POLICY "products_public_read"
  ON products FOR SELECT USING (true);

CREATE POLICY "products_admin_write"
  ON products FOR ALL USING (is_admin());

-- Orders policies
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

-- Order items policies
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

-- ── Seed Data ─────────────────────────────────────────────────────────────────

-- Categories
INSERT INTO categories (id, name, slug) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Fruits & Vegetables', 'fruits-vegetables'),
  ('a0000001-0000-0000-0000-000000000002', 'Dairy & Eggs',        'dairy-eggs'),
  ('a0000001-0000-0000-0000-000000000003', 'Meat & Seafood',      'meat-seafood'),
  ('a0000001-0000-0000-0000-000000000004', 'Bakery',              'bakery'),
  ('a0000001-0000-0000-0000-000000000005', 'Beverages',           'beverages'),
  ('a0000001-0000-0000-0000-000000000006', 'Snacks',              'snacks'),
  ('a0000001-0000-0000-0000-000000000007', 'Pantry',              'pantry')
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (name, description, price, image, stock, category_id) VALUES
  ('Organic Bananas',
   'Sweet and creamy organic bananas. Perfect for smoothies, baking, or a quick snack. Sourced from certified organic farms.',
   180, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 120,
   'a0000001-0000-0000-0000-000000000001'),

  ('Fresh Strawberries',
   'Juicy, hand-picked strawberries bursting with flavour. Perfect for desserts, jams, or eating fresh.',
   350, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', 45,
   'a0000001-0000-0000-0000-000000000001'),

  ('Whole Milk (1L)',
   'Farm-fresh full-fat whole milk. Rich in calcium and vitamins. Pasteurised and homogenised.',
   220, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 80,
   'a0000001-0000-0000-0000-000000000002'),

  ('Farm Fresh Eggs (12 pack)',
   'Free-range eggs from pasture-raised hens. Rich golden yolks with superior flavour and nutrition.',
   280, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 60,
   'a0000001-0000-0000-0000-000000000002'),

  ('Chicken Breast (500g)',
   'Tender, skinless chicken breast. High in protein, low in fat. Perfect for grilling, baking, or stir-frying.',
   650, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', 35,
   'a0000001-0000-0000-0000-000000000003'),

  ('Sourdough Bread',
   'Artisan sourdough baked fresh daily. Crispy crust, chewy crumb, and that signature tangy flavour.',
   320, 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400', 25,
   'a0000001-0000-0000-0000-000000000004'),

  ('Orange Juice (1L)',
   '100% pure squeezed orange juice. No added sugar, no concentrates. Packed with vitamin C.',
   290, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 70,
   'a0000001-0000-0000-0000-000000000005'),

  ('Greek Yogurt (500g)',
   'Thick, creamy authentic Greek yogurt. High protein, probiotic-rich, and naturally tangy.',
   240, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 55,
   'a0000001-0000-0000-0000-000000000002'),

  ('Mixed Nuts (250g)',
   'Premium blend of almonds, cashews, walnuts, and pistachios. Dry roasted with no added salt.',
   890, 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400', 40,
   'a0000001-0000-0000-0000-000000000006'),

  ('Extra Virgin Olive Oil (500ml)',
   'Cold-pressed extra virgin olive oil from Mediterranean olives. Rich in antioxidants and healthy fats.',
   1200, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 30,
   'a0000001-0000-0000-0000-000000000007'),

  ('Avocados (3 pack)',
   'Perfectly ripened Hass avocados. Creamy texture with a buttery, nutty flavour. Great for guacamole or toast.',
   420, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400', 50,
   'a0000001-0000-0000-0000-000000000001'),

  ('Cheddar Cheese (250g)',
   'Aged sharp cheddar with a rich, bold flavour. Melts beautifully. Great for sandwiches, burgers, or snacking.',
   480, 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400', 45,
   'a0000001-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- ── Admin User ────────────────────────────────────────────────────────────────
-- To create the admin user:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
-- 2. Email: admin@grocerapp.com  Password: Admin@123!
-- 3. Then run this SQL to set the admin role:
--
--   UPDATE profiles
--   SET name = 'Admin User', role = 'ADMIN'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@grocerapp.com');
--
-- OR run the following block if you have the auth schema access:
-- (Only works in local dev / self-hosted Supabase)

-- ── Storage Bucket (optional — for product images) ────────────────────────────
-- Run in Supabase Dashboard → Storage → Create bucket named "product-images"
-- Set to public bucket for easy image access.
