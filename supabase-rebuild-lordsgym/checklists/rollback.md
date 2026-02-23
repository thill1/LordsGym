# Rollback Checklist — Lord's Gym Supabase Rebuild

## When to Rollback

- Critical issues post-cutover (Admin/Store/Calendar broken)
- Auth or RLS misconfiguration
- Need to revert to primary project

## Prerequisites

- Primary project must be **reachable** (ACTIVE, not PAUSING)
- Backup of `.env.local` from before cutover (from `exports/`)

## Rollback Steps

### 1. Restore .env.local

- [ ] Copy `exports/.env.local.YYYYMMDD-HHmmss.backup` to LordsGym `.env.local`
- [ ] Or manually restore:
  - `VITE_SUPABASE_URL` = primary project URL
  - `VITE_SUPABASE_ANON_KEY` = primary anon key
  - `SUPABASE_SERVICE_ROLE_KEY` = primary service_role key

### 2. Restore GitHub Secrets

- [ ] Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to primary project values

### 3. Restore Edge Function Secrets

- [ ] Update Supabase Edge Function secrets to primary project (contact-form, stripe-checkout)

### 4. Redeploy

- [ ] Trigger deploy or push to main
- [ ] Verify app connects to primary project

### 5. Verify

- [ ] Admin login
- [ ] Store, Calendar, Contact form

---

## If Primary Is Unreachable

If the primary project (mrptukahxloqpdqiaxkb) is stuck in PAUSING or unrecoverable:

- **Rollback = stay on target (backup) project**
- No revert possible until primary recovers
- See [SUPABASE_BACKUP_DATABASE.md](../../docs/SUPABASE_BACKUP_DATABASE.md) for data re-entry guidance
