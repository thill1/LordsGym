# Supabase Database Alignment Analysis

**Purpose:** Verify that the Supabase schema and configurations align with the lordsgymoutreach.com website after a new Supabase instance was created (previous instance was paused).

**Date:** 2026-02-28

---

## Executive Summary

The LordsGym codebase expects **20 tables**, **1 RPC function**, **storage bucket `media`**, and specific RLS policies. After recreating a Supabase instance, you must:

1. **Run all migrations** in order via `npm run db:push`
2. **Create the storage bucket `media`** (the migration `20260228000000_storage_media_bucket.sql` attempts this; if it fails, create manually)
3. **Create an admin user** with `raw_user_meta_data = {"role": "admin"}`
4. **Update `.env.local`** with the new project's `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. **Seed products** (the seed migration runs as part of db:push)
6. **Verify auth URLs** in Supabase Dashboard → Authentication → URL Configuration for lordsgymoutreach.com

---

## Tables Used by the Website

| Table | Used By | Public Read? | Auth Write? |
|-------|---------|--------------|-------------|
| **settings** | StoreContext | Yes | Yes |
| **home_content** | StoreContext, HomeContentEditor | Yes | Yes |
| **outreach_content** | StoreContext, OutreachContentEditor | Yes | Yes |
| **products** | StoreContext, Shop, Admin | Yes | Yes |
| **testimonials** | StoreContext | Yes | Yes |
| **pages** | PageEditor (CMS) | Published only | Yes |
| **media** | MediaLibrary | Yes | Yes |
| **instructors** | CalendarManager | Yes | Yes |
| **calendar_recurring_patterns** | Calendar, RecurringEventsManager | Yes | Yes |
| **calendar_events** | Calendar, CalendarManager | Yes | Yes |
| **calendar_recurring_exceptions** | RecurringExceptionsManager | Yes | Yes |
| **calendar_bookings** | Calendar, BookingForm, Admin | Own rows only | Yes (own) |
| **activity_logs** | AdminDashboard, ActivityLogs | No (auth only) | Yes |
| **page_versions** | (Reserved) | No | Yes |
| **seo_settings** | SEOManager | Yes | Yes |
| **schema_markup** | SEO, schema.org | Yes (active only) | Yes |
| **page_views** | Analytics, page-view-tracker | No (auth only) | Insert anon |
| **memberships** | Stripe webhooks, Membership | Own rows only | Service role |
| **payment_intents** | Stripe checkout, webhooks | Own rows only | Service role |
| **contact_submissions** | Contact form edge function | No (admin only) | Service role |

---

## RPC Function

| Function | Purpose | Granted To |
|----------|---------|------------|
| **get_calendar_events_for_display()** | Returns calendar events with recurring pattern data; bypasses RLS so anon visitors (e.g. mobile Safari) see events | anon, authenticated |

**Source:** `supabase/migrations/20260219000000_calendar_recurring_public.sql`

---

## Storage

| Bucket | Purpose |
|--------|---------|
| **media** | Media Library uploads; public read; authenticated write |

**Migration:** `supabase/migrations/20260228000000_storage_media_bucket.sql` creates the bucket and `storage.objects` policies. If the migration fails (e.g. storage schema not initialized), create the bucket manually in **Dashboard → Storage → New bucket** with name `media`, public: true.

---

## Migration Order (Supabase runs by filename)

```
000_ensure_uuid_function.sql
001_initial_schema.sql
002_recurring_exceptions.sql
003_complete_schema.sql
004_fix_testimonials_sequence.sql
005_page_views.sql
006_popup_modals.sql
20250207_stripe_integration.sql
20250209_contact_submissions.sql
20250213_calendar_public_read.sql
20260218_recurrence_materialization.sql
20260218120000_recurrence_safety_constraints.sql
20260219000000_calendar_recurring_public.sql      ← get_calendar_events_for_display RPC
20260219010000_testimonials_google_source.sql
20260219020000_database_hardening.sql
20260220_products_image_coming_soon.sql
20260221_products_coming_soon_image.sql
20260224000000_seed_store_products.sql            ← Seeds products (m1–m7, w1, a1)
20260225000000_fix_recurring_event_times_timezone.sql
20260225000001_outreach_content.sql
20260228000000_storage_media_bucket.sql
```

---

## Critical Data to Verify / Seed

### 1. Settings (default row)
- **id:** `default`
- **site_name:** Lord's Gym
- **contact_email:** lordsgymoutreach@gmail.com
- **contact_phone:** 530-537-2105
- **address:** 258 Elm Ave, Auburn, CA 95603
- **announcement_bar:** JSONB
- **popup_modals:** JSONB (added by 006)

### 2. Home content (default row)
- **id:** `default`
- **hero:** `{headline, subheadline, ctaText, backgroundImage}`
- **values:** `{stat1, label1, stat2, label2, stat3, label3}`

### 3. Outreach content (default row)
- **id:** `default`
- **images:** `{}` (hero, trailer, outreach, prayer, hug, community)

### 4. Products
- Seed migration inserts 9 products (m1–m7, w1, a1) with titles matching lordsgymoutreach.com store (e.g. Lord's Cross Lifter Tee, etc.)

### 5. SEO settings (default row)
- **id:** `default`
- Inserted by 003_complete_schema

### 6. Admin user
- Create in **Dashboard → Authentication → Users**
- Set **Raw User Meta Data:** `{"role": "admin"}`
- Auto-confirm user so they can log in immediately

---

## Potential Issues After Recreation

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Storage bucket missing** | Media Library upload fails | Run storage migration or create bucket manually |
| **Admin can't log in** | 401 / auth error | Ensure user has `raw_user_meta_data.role = "admin"` and is confirmed |
| **Contact form fails** | 403 / policy error | Contact form uses Edge Function with service role; admins read via RLS policy on `raw_user_meta_data` |
| **Calendar empty** | No events shown | RPC `get_calendar_events_for_display` must exist; check RLS on `calendar_recurring_patterns` (public read) |
| **Products empty** | Store shows no products | Run seed migration or `npm run db:push` (includes seed) |
| **Stripe webhooks fail** | Memberships not updated | Stripe Edge Functions use service role; ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Edge Function secrets |
| **RLS blocks anon** | Public pages fail | Verify ANON_READABLE_TABLES: settings, home_content, outreach_content, products, testimonials, pages, media, instructors, calendar_*, schema_markup |

---

## Contact Submissions Policy Note

The `contact_submissions` table uses:

```sql
(u.raw_user_meta_data->>'role')::text = 'admin'
```

This reads from `auth.users.raw_user_meta_data`. Ensure admin users have this metadata set correctly.

---

## db-schema-expectations.ts Alignment

`lib/db-schema-expectations.ts` lists `EXPECTED_TABLES` and `EXPECTED_COLUMNS`. These must match the migrations. Current expectations are aligned. Run `npm run test:db-audit` (locally with Supabase configured) to validate.

---

## Checklist for New Supabase Instance

- [ ] Create new Supabase project
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` and GitHub secrets
- [ ] Run `npm run db:push` (requires `SUPABASE_DB_PASSWORD` or `SUPABASE_ACCESS_TOKEN` in `.env.local`)
- [ ] Create storage bucket `media` (public) if migration fails
- [ ] Create admin user with `raw_user_meta_data = {"role": "admin"}`
- [ ] Update Supabase Dashboard → Authentication → URL Configuration:
  - Site URL: `https://lordsgymoutreach.com`
  - Redirect URLs: `https://lordsgymoutreach.com/**`, `https://lords-gym.pages.dev/**`
- [ ] If using Stripe: set Edge Function secrets (`SUPABASE_SERVICE_ROLE_KEY`, Stripe keys)
- [ ] Verify home page loads settings, products, testimonials
- [ ] Verify admin login works
- [ ] Verify Media Library upload works
- [ ] Verify calendar RPC returns events
