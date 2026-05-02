-- ============================================================
-- Migration: atomic order placement with stock management
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================
--
-- Replaces the multi-step JS order flow with a single Postgres
-- function that runs inside one transaction:
--   1. Locks product rows (prevents concurrent over-selling)
--   2. Validates stock for every item
--   3. Calculates total price server-side (prevents price tampering)
--   4. Inserts the order row
--   5. Inserts all order_items rows
--   6. Decrements stock for each product
--
-- If any step fails the entire transaction is rolled back —
-- no dangling orders, no partially decremented stock.
-- ============================================================

CREATE OR REPLACE FUNCTION place_order(
  p_user_id           UUID,
  p_user_name         TEXT,
  p_user_email        TEXT,
  p_delivery_address  TEXT,
  p_delivery_city     TEXT,
  p_delivery_phone    TEXT,
  p_items             JSONB,            -- [{product_id: uuid, quantity: int}, ...]
  p_latitude          NUMERIC DEFAULT NULL,
  p_longitude         NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_order_id    UUID;
  v_total       NUMERIC(10,2) := 0;
  v_item        JSONB;
  v_product_id  UUID;
  v_quantity    INTEGER;
  v_price       NUMERIC(10,2);
  v_stock       INTEGER;
  v_name        TEXT;
  v_image       TEXT;
BEGIN
  -- Verify the caller is who they claim to be
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: caller does not match p_user_id';
  END IF;

  -- Validate items array is not empty
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- -------------------------------------------------------
  -- Pass 1: lock rows + validate stock + accumulate total
  -- FOR UPDATE acquires an exclusive row-level lock so no
  -- concurrent transaction can modify these rows until we
  -- commit, eliminating the race condition.
  -- -------------------------------------------------------
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INTEGER;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    SELECT price, stock
    INTO   v_price, v_stock
    FROM   products
    WHERE  id = v_product_id
    FOR    UPDATE;          -- exclusive lock held until COMMIT

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_product_id;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %',
        v_stock, v_quantity;
    END IF;

    v_total := v_total + (v_price * v_quantity);
  END LOOP;

  -- Sanity check on computed total
  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Computed order total must be greater than zero';
  END IF;

  -- -------------------------------------------------------
  -- Insert the order (total price is server-computed above,
  -- the client-supplied value is intentionally ignored)
  -- -------------------------------------------------------
  INSERT INTO orders (
    user_id, user_name, user_email, status,
    total_price,
    delivery_address, delivery_city, delivery_phone,
    latitude, longitude
  ) VALUES (
    p_user_id, p_user_name, p_user_email, 'PENDING',
    v_total,
    p_delivery_address, p_delivery_city, p_delivery_phone,
    p_latitude, p_longitude
  )
  RETURNING id INTO v_order_id;

  -- -------------------------------------------------------
  -- Pass 2: insert order_items + decrement stock
  -- Rows are still locked from pass 1 so no re-check needed.
  -- -------------------------------------------------------
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INTEGER;

    SELECT price, name, COALESCE(image, '')
    INTO   v_price, v_name, v_image
    FROM   products
    WHERE  id = v_product_id;

    INSERT INTO order_items (
      order_id, product_id, product_name, product_image, quantity, price
    ) VALUES (
      v_order_id, v_product_id, v_name, v_image, v_quantity, v_price
    );

    UPDATE products
    SET    stock = stock - v_quantity
    WHERE  id = v_product_id;
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Allow logged-in users to call this function; deny anonymous callers
REVOKE EXECUTE ON FUNCTION place_order FROM anon;
GRANT  EXECUTE ON FUNCTION place_order TO authenticated;
