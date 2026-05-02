-- ============================================================
-- Migration: add CANCELLED status + tighten total_price check
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- 1. Drop the old CHECK constraint on status
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Re-add it with CANCELLED included
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'));

-- 3. Tighten total_price: must be > 0 (was >= 0)
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_total_price_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_total_price_check
  CHECK (total_price > 0);

-- 4. Refresh the orders_user_insert RLS policy to match
DROP POLICY IF EXISTS "orders_user_insert" ON orders;
CREATE POLICY "orders_user_insert"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id AND total_price > 0);
