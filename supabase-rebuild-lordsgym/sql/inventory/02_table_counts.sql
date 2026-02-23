-- Inventory: Table row counts
-- READ-ONLY. Run via: psql "$DATABASE_URL" -f 02_table_counts.sql
-- Uses pg_stat_user_tables for approximate counts (fast, may be slightly stale)

\set QUIET on
\pset format unaligned
\pset fieldsep '|'
\t on

SELECT
  schemaname,
  relname AS table_name,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY schemaname, relname;
