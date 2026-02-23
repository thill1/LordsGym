# Cutover Checklist — Lord's Gym Supabase Rebuild

## Pre-Cutover

- [ ] All validations green (run `scripts/powershell/05_run_validation.ps1`)
- [ ] RLS audit reviewed (`sql/validation/rls_audit.sql`)
- [ ] Media bucket exists and is public
- [ ] Admin user can log in to target project
- [ ] Target project URL and keys documented securely

## .env Backup (Required)

- [ ] Run `scripts/powershell/01_backup_env.ps1` — creates `exports/.env.local.YYYYMMDD-HHmmss.backup`
- [ ] Confirm backup file exists before changing `.env.local`

## Update Credentials

- [ ] Update LordsGym `.env.local`:
  - `VITE_SUPABASE_URL` = target project URL
  - `VITE_SUPABASE_ANON_KEY` = target anon key
  - `SUPABASE_SERVICE_ROLE_KEY` = target service_role key
- [ ] Update GitHub repository secrets (if using CI/CD):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Update Supabase Edge Function secrets (if deployed):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Affected functions: contact-form, stripe-checkout

## Auth Configuration (Target Project)

- [ ] Dashboard → Auth → URL Configuration
  - Site URL: `https://lords-gym.pages.dev` or `https://lordsgymoutreach.com`
  - Redirect URLs: Add production URLs
- [ ] Verify email provider enabled
- [ ] Admin user exists (or create via `scripts/create-admin-user.js`)

## Deploy

- [ ] Trigger deploy (or push to main)
- [ ] Verify build succeeds

## Smoke Test

- [ ] Admin login
- [ ] Store (products, cart, checkout flow)
- [ ] Calendar (recurring events, bookings)
- [ ] Contact form submission

## Post-Cutover

- [ ] Monitor logs for errors
- [ ] Verify Auth redirects work in production
- [ ] Confirm no 522/timeout from origin
