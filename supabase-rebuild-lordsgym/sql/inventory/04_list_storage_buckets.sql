-- Inventory: List storage buckets
-- READ-ONLY. Run via: psql "$DATABASE_URL" -f 04_list_storage_buckets.sql
-- Requires access to storage schema (Supabase projects have this)

\set QUIET on
\pset format wrapped
\pset columns 80

SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY name;
