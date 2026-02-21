# Database Audit & Testing

This document describes the database audit and test strategy used to ensure schema integrity and build/deploy confidence.

## Overview

| Artifact | Purpose | When It Runs |
|----------|---------|--------------|
| **Unit tests** (`npm run test`) | Schema expectations, store sync, calendar utils, Google reviews logic | Every build (CI), pre-deploy |
| **DB audit** (`npm run test:db-audit`) | Verifies Supabase connectivity, tables, columns, RPC against live DB | When Supabase credentials are available (CI secrets, local .env.local) |
| **E2E tests** (`npm run test:e2e`) | Full user flows against deployed site | Post-deploy (optional) |

## Unit Tests (No Supabase Required)

Run: `npm run test`

- **lib/db-schema-expectations.test.ts** — Validates that `EXPECTED_TABLES`, `ANON_READABLE_TABLES`, `EXPECTED_COLUMNS` stay in sync with app usage. No DB connection.
- **lib/store-products.test.ts** — Product sync logic (guards against re-adding deleted products).
- **lib/calendar-utils.test.ts** — Recurrence expansion and deduplication.
- **lib/google-reviews.test.ts** — Google reviews fetch logic (mocked).

These run in CI and must pass before build.

## Database Audit (Requires Supabase)

Run: `npm run test:db-audit`

Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (or env).

The audit:

1. Connects with anon key (same as client)
2. Verifies connectivity and core reads (settings, home_content, products, testimonials)
3. Checks all anon-readable tables exist and are readable
4. Validates `products.image_coming_soon` and `testimonials.source` / `external_id` columns
5. Calls `get_calendar_events_for_display` RPC
6. Verifies `settings.popup_modals` column
7. Tests `page_views` INSERT (anon) for analytics

**If audit fails:** Apply migrations with `npm run db:push`, or apply pending schema only with `npm run db:apply-pending`, then re-run the audit.

**If Supabase not configured:** Audit exits 0 (skipped). No credentials = no failure.

## CI Integration

In `.github/workflows/cloudflare-pages.yml`:

- **Run tests** — `npm run test` (always)
- **Run database audit** — `node scripts/db-audit.mjs` when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets are set

Fork PRs typically don't have secrets; the audit step skips gracefully.

## Schema Expectations

`lib/db-schema-expectations.ts` is the single source of truth for:

- `EXPECTED_TABLES` — All tables from migrations
- `ANON_READABLE_TABLES` — Tables the app reads with anon key
- `EXPECTED_COLUMNS` — Key columns for StoreContext, calendar, etc.
- `EXPECTED_RPC_FUNCTIONS` — RPCs used by the app

When adding migrations, update `db-schema-expectations.ts` and `scripts/db-audit.mjs` if new tables or columns affect app logic.

## Local Pre-Deploy Checklist

Before deploying:

1. `npm run test` — unit tests pass
2. `npm run test:db-audit` — DB audit passes (if Supabase configured)
3. `npm run type-check` — no TypeScript errors
4. `npm run build` — build succeeds

## Adding New Tests

- **Schema-related:** Add expectations to `lib/db-schema-expectations.ts` and corresponding assertions in `lib/db-schema-expectations.test.ts`
- **DB connectivity/columns:** Add checks to `scripts/db-audit.mjs`
- **Business logic:** Add Vitest tests in `lib/*.test.ts`
