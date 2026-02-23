-- Inventory: Export schema metadata for comparison
-- READ-ONLY. Run against source or target via: psql "$DATABASE_URL" -f 01_export_schema.sql
-- Output: List of tables, columns, types in public schema

\set QUIET on
\pset format unaligned
\pset fieldsep '|'
\t on

-- Tables and column count
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  (SELECT count(*) FROM information_schema.columns col
   WHERE col.table_schema = n.nspname AND col.table_name = c.relname) AS column_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY n.nspname, c.relname;
