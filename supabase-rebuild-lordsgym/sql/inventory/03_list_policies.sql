-- Inventory: List all RLS policies in public schema
-- READ-ONLY. Run via: psql "$DATABASE_URL" -f 03_list_policies.sql

\set QUIET on
\pset format wrapped
\pset columns 120

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
