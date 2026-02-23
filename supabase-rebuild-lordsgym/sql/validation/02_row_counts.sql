-- Validation: Row counts for comparison (source vs target)
-- Run against source AND target; diff outputs to exports/counts/
-- READ-ONLY.

\set QUIET on
\pset format unaligned
\pset fieldsep '|'
\t on

SELECT
  relname AS table_name,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;
