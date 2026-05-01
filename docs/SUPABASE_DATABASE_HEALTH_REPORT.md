# Supabase Database Health Report

**Project:** LordsGym (ktzvzossoyyfvexkgagm)  
**Generated:** 2026-02-28  
**Context:** New Supabase instance created after previous instance was paused. 113 Advisor issues reported in Dashboard.

---

## Executive Summary

The Supabase Database Advisors (Performance + Security) run 24 checks. With ~20 tables and many foreign keys, RLS policies, indexes, and extensions, **113 findings** are typical for a project of this size. Most are actionable; some are informational.

**To get your full report via CLI:**

1. Add to `.env.local`:
   - `SUPABASE_ACCESS_TOKEN=sbp_xxx` (from https://supabase.com/dashboard/account/tokens)
   - **OR** `SUPABASE_DB_PASSWORD=your_project_db_password`
2. Run: `node --env-file=.env.local scripts/supabase-inspect-report.mjs`
3. This runs: outliers, calls, long-running-queries, blocking, index-stats, table-stats, db-stats, bloat, vacuum-stats, traffic-profile

**To view 113 Advisor issues in Dashboard:**
- https://supabase.com/dashboard/project/ktzvzossoyyfvexkgagm/database/performance-advisor
- https://supabase.com/dashboard/project/ktzvzossoyyfvexkgagm/database/security-advisor

---

## Supabase Advisor Check Types (24 Total)

| ID | Check | Typical LordsGym Impact |
|----|-------|-------------------------|
| **001** | Unindexed foreign keys | calendar_events.instructor_id, calendar_events.recurring_pattern_id, calendar_bookings.event_id, calendar_bookings.user_id, page_versions.page_id, activity_logs.user_id |
| **002** | Auth users exposed | auth.users referenced by RLS; ensure no public table exposes auth.users |
| **003** | Auth RLS initplan | RLS policies using auth.uid() / auth.jwt() – expected |
| **004** | No primary key | All LordsGym tables have PKs; unlikely |
| **005** | Unused indexes | Indexes never scanned; some may be unused early in lifecycle |
| **006** | Multiple permissive policies | Tables with multiple RLS policies (e.g. calendar_bookings) |
| **007** | Policy exists, RLS disabled | None expected – all tables have RLS enabled |
| **008** | RLS enabled, no policy | Would block all access – none expected |
| **009** | Duplicate indexes | Overlapping indexes on same columns |
| **010** | Security definer view | active_memberships_view, has_active_membership(), get_user_membership() – expected |
| **011** | Function search path mutable | get_calendar_events_for_display() – should use SET search_path = public |
| **012** | Auth allow anonymous sign ins | Expected if using anon for public read |
| **013** | RLS disabled on public schema | Tables in public schema – RLS enabled |
| **014** | Extension in public | uuid-ossp, pg_stat_statements, etc. – informational |
| **015** | RLS references user metadata | calendar_bookings policy uses auth.jwt()->'user_metadata'->>'role' |
| **016** | Materialized view in API | None in LordsGym |
| **017** | Foreign table in API | None |
| **018** | Unsupported reg types | Rare |
| **019** | Insecure queue exposed in API | None |
| **020** | Table bloat | Dead tuples from updates/deletes – run VACUUM |
| **021** | Fkey to auth unique | calendar_bookings.user_id, memberships.user_id – expected |
| **022** | Extension versions outdated | Check Supabase Dashboard |
| **023** | Sensitive columns exposed | Ensure no API exposure of secrets |
| **024** | Permissive RLS policy | Default; restrictive policies are alternative |

---

## Likely High-Impact Issues (by check)

### 1. Unindexed Foreign Keys (001)

**Tables and FKs to index:**

| Table | Column | References | Index Exists? |
|-------|--------|------------|---------------|
| calendar_events | instructor_id | instructors(id) | idx_calendar_events_instructor_id (from migration) |
| calendar_events | recurring_pattern_id | calendar_recurring_patterns(id) | idx_calendar_events_recurring_pattern_id_start_time |
| calendar_bookings | event_id | calendar_events(id) | idx_calendar_bookings_event_id |
| calendar_bookings | user_id | auth.users(id) | idx_calendar_bookings_user_id |
| calendar_recurring_exceptions | recurring_pattern_id | calendar_recurring_patterns(id) | idx_recurring_exceptions_pattern_id |
| page_versions | page_id | pages(id) | idx_page_versions_page_id |
| activity_logs | user_id | auth.users(id) | idx_activity_logs_user_id |
| memberships | user_id | auth.users(id) | idx_memberships_user_id |
| payment_intents | user_id | auth.users(id) | idx_payment_intents_user_id |
| media | (no FK) | - | - |

**Action:** Run Performance Advisor and add any missing indexes it suggests.

### 2. Unused Indexes (005)

Early in a new instance, many indexes may show zero scans. Re-run after traffic; remove only if consistently unused.

### 3. Table Bloat (020)

**Action:** In Dashboard → Database → Extensions, ensure `pg_stat_statements` is enabled. Run:

```sql
VACUUM ANALYZE;
```

Or per-table: `VACUUM ANALYZE products;` etc.

### 4. Slow Queries (CLI: outliers, calls)

Run:

```bash
node --env-file=.env.local scripts/supabase-inspect-report.mjs
```

Review `outliers` (total execution time) and `calls` (call count). Focus on:
- `get_calendar_events_for_display`
- PostgREST queries to products, testimonials, settings, home_content, outreach_content

### 5. Function Search Path (011)

Ensure `get_calendar_events_for_display` has:

```sql
SET search_path = public
```

The migration `20260219000000_calendar_recurring_public.sql` sets this.

---

## Database Health Checklist

| Check | Status | Action |
|-------|--------|--------|
| All migrations applied | ⬜ | Run `npm run db:push` |
| Storage bucket `media` exists | ⬜ | Run storage migration or create manually |
| Admin user with role metadata | ⬜ | Create user with `{"role": "admin"}` |
| Products seeded | ⬜ | Seed migration runs with db:push |
| RPC get_calendar_events_for_display | ⬜ | Should exist from migration |
| Auth URLs for lordsgymoutreach.com | ⬜ | Configure in Dashboard → Auth → URL Configuration |
| pg_stat_statements enabled | ⬜ | Required for slow-query insights |
| VACUUM ANALYZE run | ⬜ | Run periodically or after bulk changes |

---

## How to Get Full 113-Issue Breakdown

1. **Dashboard (recommended):**
   - Go to https://supabase.com/dashboard/project/ktzvzossoyyfvexkgagm/database/performance-advisor
   - Go to https://supabase.com/dashboard/project/ktzvzossoyyfvexkgagm/database/security-advisor
   - Export or copy each finding; group by check type.

2. **CLI inspect (slow queries, indexes, bloat):**
   - Add `SUPABASE_ACCESS_TOKEN` or `SUPABASE_DB_PASSWORD` to `.env.local`
   - Run: `node --env-file=.env.local scripts/supabase-inspect-report.mjs`

3. **Direct SQL (if you have DB connection):**
   - Query `pg_stat_statements` for slow queries
   - Query `pg_stat_user_indexes` for index usage
   - Query `pg_stat_user_tables` for table stats

---

## Recommended Next Steps

1. Add `SUPABASE_ACCESS_TOKEN` or `SUPABASE_DB_PASSWORD` to `.env.local` (never commit).
2. Run `node --env-file=.env.local scripts/supabase-inspect-report.mjs` and save output.
3. In Dashboard, export or document all 113 Advisor issues by check type.
4. Prioritize: unindexed foreign keys → table bloat → unused indexes → other findings.
5. Create migrations for new indexes; run `VACUUM ANALYZE` for bloat.
6. Re-run Advisors and inspect report after changes.
