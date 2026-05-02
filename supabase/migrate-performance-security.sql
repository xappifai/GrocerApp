-- ============================================================
-- Migration: performance + security hardening
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Safe to run on an existing database.
-- ============================================================


-- ===========================================================
-- Issue 17: Tighten orders insert policy so total_price > 0
-- A direct Supabase SDK call cannot insert a zero-price order.
-- ===========================================================
DROP POLICY IF EXISTS "orders_user_insert" ON orders;

CREATE POLICY "orders_user_insert"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND total_price > 0
  );


-- ===========================================================
-- Issue 19: Replace unused GIN tsvector index with a trigram
-- index that actually supports ILIKE partial-match searches.
-- pg_trgm is pre-installed on all Supabase projects.
-- ===========================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop the old tsvector GIN index (it was never used by ILIKE)
DROP INDEX IF EXISTS idx_products_name;

-- New trigram indexes — used by ILIKE %term% queries
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_description_trgm
  ON products USING gin (description gin_trgm_ops);


-- ===========================================================
-- Issue 20: DELETE policies for contact_messages and orders
-- ===========================================================

-- Admins can delete contact messages (GDPR compliance)
DROP POLICY IF EXISTS "contact_messages_admin_delete" ON contact_messages;
CREATE POLICY "contact_messages_admin_delete"
  ON contact_messages FOR DELETE USING (is_admin());

-- Admins can delete orders (data management / test cleanup)
DROP POLICY IF EXISTS "orders_admin_delete" ON orders;
CREATE POLICY "orders_admin_delete"
  ON orders FOR DELETE USING (is_admin());


-- ===========================================================
-- Issue 18: Single-query homepage section loader (RPC)
-- Replaces 1+N parallel queries with one DB round-trip.
-- Called via supabase.rpc('get_homepage_sections').
-- ===========================================================
CREATE OR REPLACE FUNCTION get_homepage_sections(section_limit INT DEFAULT 8)
RETURNS TABLE (
  category_id   UUID,
  category_name TEXT,
  category_slug TEXT,
  category_image TEXT,
  total         BIGINT,
  products      JSON
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH ranked AS (
    SELECT
      p.id, p.name, p.description, p.price, p.image, p.stock,
      p.category_id, p.created_at, p.updated_at,
      ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.created_at DESC) AS rn,
      COUNT(*)     OVER (PARTITION BY p.category_id)                            AS cat_total
    FROM products p
  )
  SELECT
    c.id,
    c.name,
    c.slug,
    c.image,
    MAX(r.cat_total)::BIGINT AS total,
    json_agg(
      json_build_object(
        'id',          r.id,
        'name',        r.name,
        'description', r.description,
        'price',       r.price,
        'image',       r.image,
        'stock',       r.stock,
        'category_id', r.category_id,
        'created_at',  r.created_at,
        'updated_at',  r.updated_at,
        'categories',  json_build_object(
                         'id',    c.id,
                         'name',  c.name,
                         'slug',  c.slug,
                         'image', c.image
                       )
      ) ORDER BY r.rn
    ) AS products
  FROM ranked r
  JOIN categories c ON c.id = r.category_id
  WHERE r.rn <= section_limit
  GROUP BY c.id, c.name, c.slug, c.image
  HAVING MAX(r.cat_total) > 0
  ORDER BY c.name;
$$;
