-- ============================================================
-- Migration: add missing columns to profiles and orders
-- Run this ONLY if you already ran schema.sql before 2025-05-02.
-- If you are starting fresh, schema.sql already includes these.
-- ============================================================

-- profiles: delivery info (phone, address, city, coordinates)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- orders: GPS coordinates captured at checkout
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Fix the signup trigger: remove the ability to self-assign ADMIN via metadata.
-- Role is now always forced to CLIENT on signup.
-- Promote admins manually: UPDATE profiles SET role = 'ADMIN' WHERE id = '...';
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'CLIENT'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
