-- RLS Audit: Lord's Gym
-- Run against target after migrations. Flags potential security issues.
-- Never assume RLS is correct; always audit.

-- =============================================================================
-- 1. Tables with RLS enabled
-- =============================================================================
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- =============================================================================
-- 2. Tables with RLS enabled but NO policies (blocks all access)
-- =============================================================================
SELECT c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = n.nspname AND p.tablename = c.relname
  )
ORDER BY c.relname;

-- =============================================================================
-- 3. Policies with USING (true) on WRITE (INSERT/UPDATE/DELETE) - RISKY
-- =============================================================================
SELECT
  tablename,
  policyname,
  cmd,
  qual AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename, policyname;

-- =============================================================================
-- 4. User-scoped tables: policies using auth.role() without auth.uid()
--    (calendar_bookings, memberships, payment_intents should scope by user_id)
-- =============================================================================
SELECT
  tablename,
  policyname,
  cmd,
  qual AS using_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('calendar_bookings', 'memberships', 'payment_intents')
  AND qual LIKE '%auth.role()%'
  AND qual NOT LIKE '%auth.uid()%'
ORDER BY tablename, policyname;

-- =============================================================================
-- 5. Full policy list for manual review
-- =============================================================================
SELECT
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
