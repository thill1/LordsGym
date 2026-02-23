# Lord's Gym — Supabase Database Configuration Verification

**Project:** Lords Gym  
**Project ID:** `mrptukahxloqpdqiaxkb`  
**Region:** West US (Oregon)

---

## 1. Project Configuration

| Setting | Expected | Source |
|---------|----------|--------|
| Project ID | `mrptukahxloqpdqiaxkb` | `supabase/.temp/project-ref`, `config.toml` |
| URL | `https://mrptukahxloqpdqiaxkb.supabase.co` | `.env.local` |
| Linked | ● Lords Gym | `supabase projects list` |

---

## 2. Tables (20 expected)

| Table | RLS | Anon SELECT | Purpose |
|-------|-----|-------------|---------|
| settings | ✓ | ✓ | Site config, popup_modals |
| home_content | ✓ | ✓ | Hero, values |
| products | ✓ | ✓ | Store products |
| testimonials | ✓ | ✓ | With source, external_id |
| pages | ✓ | ✓ | CMS pages |
| media | ✓ | ✓ | Media library |
| instructors | ✓ | ✓ | Calendar instructors |
| calendar_recurring_patterns | ✓ | ✓ | Recurring event patterns |
| calendar_events | ✓ | ✓ | Calendar events |
| calendar_recurring_exceptions | ✓ | ✓ | Recurrence overrides |
| calendar_bookings | ✓ | user_id only | User bookings |
| page_versions | ✓ | auth only | Page history |
| activity_logs | ✓ | auth only | Admin activity |
| seo_settings | ✓ | ✓ | SEO metadata |
| schema_markup | ✓ | ✓ (is_active) | Structured data |
| page_views | ✓ | INSERT anon | Analytics |
| memberships | ✓ | own rows | Stripe memberships |
| payment_intents | ✓ | own rows | Stripe payments |
| contact_submissions | ✓ | service_role/admin | Contact form |

---

## 3. Products Table — Columns

| Column | Type | Migration |
|--------|------|-----------|
| id | TEXT PK | 001 |
| title | TEXT NOT NULL | 001 |
| price | DECIMAL(10,2) | 001 |
| category | TEXT | 001 |
| image | TEXT | 001 |
| description | TEXT | 001 |
| inventory | JSONB | 001 |
| variants | JSONB | 001 |
| featured | BOOLEAN | 001 |
| image_coming_soon | BOOLEAN DEFAULT false | 20260220 |
| coming_soon_image | TEXT | 20260221 |

---

## 4. Settings Table — Columns

| Column | Purpose |
|--------|---------|
| id | PRIMARY KEY (default: 'default') |
| site_name | Site title |
| contact_email | Contact email |
| contact_phone | Contact phone |
| address | Address |
| google_analytics_id | GA ID |
| announcement_bar | JSONB |
| popup_modals | JSONB (array of popup configs) |

---

## 5. Testimonials Table — Columns

| Column | Purpose |
|--------|---------|
| source | 'manual' \| 'google' |
| external_id | Google Place Review ID |
| idx_testimonials_source_external_id | UNIQUE (source, external_id) WHERE external_id IS NOT NULL |

---

## 6. RLS Policies — Public (anon) access

| Table | Policy | Condition |
|-------|--------|-----------|
| settings | viewable by everyone | true |
| home_content | viewable by everyone | true |
| products | viewable by everyone | true |
| testimonials | viewable by everyone | true |
| pages | viewable (published or auth) | published = true OR auth.role() = 'authenticated' |
| media | viewable by everyone | true |
| instructors | viewable by everyone | true |
| calendar_events | viewable by everyone | true |
| calendar_recurring_patterns | viewable by everyone | true |
| calendar_recurring_exceptions | viewable by everyone | true |
| seo_settings | viewable by everyone | true |
| schema_markup | viewable (active only) | is_active = true |
| page_views | INSERT anon | WITH CHECK (true) |

---

## 7. RPC Functions

| Function | Grants | Purpose |
|----------|--------|---------|
| get_calendar_events_for_display() | anon, authenticated | Returns calendar events with recurring pattern data; SECURITY DEFINER |

---

## 8. Edge Functions (config.toml)

| Function | verify_jwt |
|----------|------------|
| stripe-webhook | false |
| contact-form | false |
| google-reviews | false |

---

## 9. Verification Commands

When Supabase is reachable (no 522):

```bash
# 1. Run full app audit (anon key)
node --env-file=.env.local scripts/db-audit.mjs

# 2. Inspect remote DB (requires SUPABASE_ACCESS_TOKEN)
$env:SUPABASE_ACCESS_TOKEN = "..."
npx supabase inspect db table-stats --linked
npx supabase inspect db db-stats --linked

# 3. Schema dump (requires SUPABASE_DB_PASSWORD)
npx supabase db dump --linked -f schema.sql
```

---

## 10. Migration Order

1. `001_initial_schema.sql`
2. `002_recurring_exceptions.sql`
3. `003_complete_schema.sql`
4. `004_fix_testimonials_sequence.sql`
5. `005_page_views.sql`
6. `006_popup_modals.sql`
7. `20250207_stripe_integration.sql`
8. `20250209_contact_submissions.sql`
9. `20250213_calendar_public_read.sql`
10. `20260218_recurrence_safety_constraints.sql`
11. `20260218_recurrence_materialization.sql`
12. `20260219_calendar_recurring_public.sql`
13. `20260219_database_hardening.sql`
14. `20260219_testimonials_google_source.sql`
15. `20260220_products_image_coming_soon.sql`
16. `20260221_products_coming_soon_image.sql`

---

## 11. Current Connectivity Note

**522 Connection timed out** — Supabase origin is not completing connections from this environment. This can be temporary. When connectivity returns, run:

```
npm run test:db-audit
```

to verify all app-critical paths pass.
