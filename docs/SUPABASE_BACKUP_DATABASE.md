# Supabase Backup Database — Recovery Insurance

**Purpose:** Have a ready-to-use backup Supabase project in case the primary database (`mrptukahxloqpdqiaxkb`) cannot be recovered from PAUSING or other failures.

---

## Overview

| What's backed up | Location | When usable |
|------------------|----------|-------------|
| **Schema** | `supabase/migrations/` | Always — migrations are source of truth |
| **Consolidated SQL** | `scripts/export-schema-backup.mjs` | After running the script |
| **Backup project** | New Supabase project | After provisioning (see below) |

**Data that lives only in the primary DB** (not in code): calendar events, custom pages, auth users, testimonials, products catalog, settings. If the primary DB is unreachable, this data cannot be exported until/unless it recovers.

---

## Step 1: Create the Backup Project

### Option A — Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. **Name:** `Lords Gym Backup`
3. **Database password:** Choose a strong password and **save it securely** (e.g. password manager)
4. **Region:** `us-west-2` (same as primary for consistency)
5. Click **Create new project** and wait for provisioning (~2 minutes)

### Option B — Via Script (Management API)

```powershell
# Requires: SUPABASE_ACCESS_TOKEN, BACKUP_DB_PASSWORD, and optional BACKUP_ORG_SLUG
$env:BACKUP_DB_PASSWORD = "YourStrongPasswordHere"
node --env-file=.env.local scripts/create-backup-project.mjs
```

The script will attempt to create a project via the Management API. If it fails (e.g. token scope), use Option A instead.

---

## Step 2: Apply Migrations to the Backup Project

1. In the new project’s **Settings → API**, copy:
   - Project URL (e.g. `https://xxxxxxxx.supabase.co`)
   - `anon` key (public)
   - `service_role` key (secret)

2. Create a temporary env file or override:

```powershell
# Backup project credentials (replace with your backup project's values)
$env:VITE_SUPABASE_URL = "https://YOUR_BACKUP_PROJECT_REF.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "eyJ..."
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."

# Link Supabase CLI to the backup project and push migrations
npx supabase link --project-ref YOUR_BACKUP_PROJECT_REF
npm run db:push
```

Or run the provisioning script (see Step 3).

---

## Step 3: Provision the Backup Project

Run the same setup used for the primary project. If you see **"signature verification failed"** or **"Invalid API key"**, see [SUPABASE_JWT_PROVISIONING_WORKAROUND.md](SUPABASE_JWT_PROVISIONING_WORKAROUND.md) for fixes (correct keys or manual provisioning).

```powershell
# Point .env.local to backup project temporarily, or use env vars
$env:VITE_SUPABASE_URL = "https://YOUR_BACKUP_PROJECT_REF.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "your_backup_anon_key"
$env:SUPABASE_SERVICE_ROLE_KEY = "your_backup_service_role_key"

node scripts/complete-supabase-with-service-key.js
```

This creates:

- `media` storage bucket
- Admin user (if configured)
- Default `settings` row
- Other bootstrap data

---

## Step 4: Store Backup Credentials Securely

Create a secure note (e.g. 1Password, Bitwarden) with:

| Field | Value |
|-------|-------|
| Project ref | `xxxxxxxx` (from URL) |
| Project URL | `https://xxxxxxxx.supabase.co` |
| Anon key | `eyJ...` |
| Service role key | `eyJ...` |
| Database password | (from project creation) |

**Do not commit these to git.**

---

## Step 5: (Optional) Export Schema to a Single SQL File

If you want a portable schema backup independent of the Supabase CLI:

```powershell
node scripts/export-schema-backup.mjs
```

This writes `backup/schema-YYYYMMDD.sql` — a concatenation of all migrations in order. You can restore it to any Postgres-compatible database.

---

## Switching to the Backup as Production

If the primary project cannot be recovered:

1. Update `.env.local` with the backup project’s URL and keys.
2. Update GitHub secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) for CI/deploys.
3. Update Supabase secrets for Edge Functions (e.g. `contact-form`, `stripe-checkout`).
4. Deploy. The app will use the backup database.

**Note:** You will need to re-enter:

- Calendar events and recurring patterns
- Custom pages (unless previously exported)
- Auth users (create admin again via `scripts/create-admin-user.js` or `scripts/set-admin-password.js`)
- Products, testimonials, settings (or migrate from exports if you had them)

---

## Try to Export Data (If Primary Becomes Reachable)

If the primary DB recovers (even briefly), run a full backup:

1. Get the direct database connection string from **Project Settings → Database**.
2. Add to `.env.local` (temporarily):

   ```
   SUPABASE_DB_URL=postgresql://postgres.[ref]:[YOUR_DB_PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
   ```

3. Run:

   ```powershell
   pg_dump "$env:SUPABASE_DB_URL" -F c -f backup/lords_gym_full_$(Get-Date -Format 'yyyyMMdd').dump
   ```

4. Remove `SUPABASE_DB_URL` from `.env.local` after the backup.

---

## Related

- [BACKUP_RESTORE.md](BACKUP_RESTORE.md) — General backup/restore procedures
- [SUPABASE_PAUSING_RECOVERY.md](SUPABASE_PAUSING_RECOVERY.md) — Recovery when stuck in PAUSING
- [SUPABASE_PAUSING_STUCK.md](SUPABASE_PAUSING_STUCK.md) — Troubleshooting
