# Supabase Database Inspect Report

**Project:** ktzvzossoyyfvexkgagm  
**Date:** 2026-02-28  
**Run:** `npm run inspect:supabase`

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Database size** | 53 MB |
| **WAL size** | 240 MB |
| **Index cache hit rate** | 100% |
| **Table cache hit rate** | 100% |
| **Long-running queries (>5min)** | 0 |
| **Lock blocking** | 0 |

**Overall health: Good.** Cache hit rates are 100%, no blocking. Main concerns: products table size (41 MB for 14 rows) and products upsert accounting for 40% of execution time.

---

## 1. Slow/Resource-Intensive Queries (Outliers)

| Query Type | Exec Time | % of Total | Calls |
|------------|-----------|------------|-------|
| pg_available_extensions (Dashboard metadata) | 3.98s | 68.9% | 41 |
| Tables schema (Dashboard) | 0.42s | 7.2% | 20 |
| count_estimate (Dashboard) | 0.40s | 6.9% | 20 |
| information_schema.schemata (Dashboard) | 0.27s | 4.7% | 43 |

**Note:** Top outliers are Supabase Dashboard/CLI internal queries, not LordsGym app queries.

---

## 2. Most-Called Queries (App Impact)

| Query | Exec Time | % of Total | Calls |
|-------|-----------|------------|-------|
| **Products INSERT/UPDATE (upsert)** | 1m 23s | **39.9%** | 1,207 |
| set_config (PostgREST session) | 6.3s | 3.0% | 6,955 |
| set_config (PostgREST session) | 7.7s | 3.7% | 3,262 |

**Action:** Products upsert is the heaviest app query. Likely from sync/bulk operations. Consider batching or reducing frequency.

---

## 3. Index Stats – Unused vs Used

**Heavily used (keep):**
- products_pkey (1,273 scans)
- idx_calendar_bookings_event_status (8,727 scans)
- calendar_recurring_patterns_pkey (1,045)
- testimonials_pkey (467)
- settings_pkey (479)
- home_content_pkey (323)

**Unused (0 scans):** 46 indexes marked unused. Many are on low-traffic tables (memberships, payment_intents, contact_submissions, media, page_versions). Early in instance lifecycle – **do not remove yet**; revisit after more traffic.

---

## 4. Table Sizes

| Table | Size | Rows | Note |
|-------|------|------|------|
| **products** | **41 MB** | 14 | **~3 MB/row – investigate** |
| page_views | 272 kB | 424 | OK |
| calendar_events | 208 kB | 53 | OK |
| pages | 80 kB | 7 | OK |
| activity_logs | 80 kB | 37 | OK |
| Others | < 72 kB | – | OK |

**Action:** Products table is large for 14 rows. Check for oversized image URLs, JSONB, or TOAST. Possible causes: long URLs, large inventory/variants JSON.

---

## 5. Table Bloat

| Object | Bloat | Waste |
|--------|-------|-------|
| page_views (table) | 1.2 | 16 kB |
| calendar_events (table) | 2.0 | 8 kB |
| Various indexes | 2.0 | 8 kB each |

**Action:** Run `VACUUM ANALYZE;` to reclaim space and update stats. Low urgency.

---

## 6. Vacuum Stats

| Table | Dead Rows | Last Auto Vacuum | Last Auto Analyze |
|-------|-----------|------------------|-------------------|
| home_content | 10 | – | 2026-02-26 |
| products | 34 | – | 2026-02-27 |
| settings | 10 | – | 2026-02-26 |
| testimonials | 2 | – | 2026-02-27 |
| calendar_events | 0 | 2026-02-26 | 2026-02-26 |

**Action:** Run `VACUUM ANALYZE home_content, products, settings, testimonials;` to clear dead rows.

---

## 7. Traffic Profile

**Write-heavy tables:** products (29.7:1), testimonials (51.4:1), settings (143:1), home_content (138:1), calendar_events (2.9:1), page_views (3.7:1).

**Read-only:** auth.users, auth.sessions, auth.identities, calendar_recurring_patterns, activity_logs, pages, seo_settings.

---

## Recommended Actions

1. **Investigate products table size** – 41 MB for 14 rows. Inspect image URLs, inventory/variants JSONB.
2. **Run VACUUM ANALYZE** – `VACUUM ANALYZE home_content, products, settings, testimonials;`
3. **Review products upsert frequency** – 1,207 calls; 40% of exec time. Batch or reduce if possible.
4. **Keep unused indexes** – Revisit after more traffic; do not drop yet.
5. **113 Advisor issues** – Resolve in Dashboard → Performance Advisor / Security Advisor; CLI inspect covers slow queries and bloat.

---

## Re-run Inspect

```bash
npm run inspect:supabase
```
