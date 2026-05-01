# Daily backup (GitHub Actions + Supabase + Cloudflare R2)

Automated end-of-day backup: **GitHub Actions** runs on a schedule, exports **Supabase** schema and calendar data, and uploads artifacts to **Cloudflare R2**.

## What runs

| Step | Description |
|------|-------------|
| **Schedule** | Every day at **07:00 UTC**. In Pacific: **midnight (12:00 AM) during PDT** (Mar–Nov), **11:00 PM previous day** during PST (Nov–Mar). |
| **Schema** | `npm run backup:schema` → single SQL file from `supabase/migrations/` → R2 `backups/YYYYMMDD/schema/`. |
| **Calendar** | `scripts/export-calendar-backup.mjs` → JSON per table (instructors, calendar_events, calendar_bookings, etc.) → R2 `backups/YYYYMMDD/calendar/`. |
| **Upload** | AWS CLI (S3-compatible) uploads to your R2 bucket. |

R2 layout:

```
backups/
  20260225/
    schema/
      schema-20260225.sql
    calendar/
      instructors.json
      calendar_recurring_patterns.json
      calendar_recurring_exceptions.json
      calendar_events.json
      calendar_bookings.json
  20260226/
    ...
```

## Prerequisites

1. **Supabase** — same project as production (or the project you want to back up).
2. **Cloudflare** — R2 enabled; one bucket for backups.
3. **GitHub** — repo with Actions enabled; secrets for Supabase and R2.

## 1. Create R2 bucket

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**.
2. **Create bucket** → name e.g. `lords-gym-backups` (lowercase, numbers, hyphens only).
3. Note your **Account ID** (right-hand sidebar or **R2** → **Manage R2 API Tokens**; same ID used for Pages).

## 2. Create R2 API token (for GitHub Actions)

1. In **R2** → **Manage R2 API Tokens** → **Create API token**.
2. Name: e.g. `github-backup-daily`.
3. **Permissions:** **Object Read and Write**.
4. **Scope:** restrict to the bucket you created (e.g. `lords-gym-backups`).
5. **Create API Token**.
6. Copy and store securely:
   - **Access Key ID**
   - **Secret Access Key** (shown once only).

R2 endpoint for S3-compatible clients: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (no bucket in the URL; bucket is in the path).

## 3. GitHub repository secrets

In the repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add:

| Secret | Description | Where to get it |
|--------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) | Supabase Dashboard → Settings → API |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | R2 or Pages overview (you may already have this for deploy) |
| `R2_BACKUP_BUCKET` | R2 bucket name | e.g. `lords-gym-backups` |
| `R2_ACCESS_KEY_ID` | R2 API token Access Key ID | From step 2 |
| `R2_SECRET_ACCESS_KEY` | R2 API token Secret Access Key | From step 2 |

`VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must point to the project you want to back up (usually production).

## 4. Run the workflow

- **Automatic:** Runs daily at 07:00 UTC.
- **Manual:** **Actions** → **Daily backup (Supabase → R2)** → **Run workflow**. Optionally check **Skip uploading to R2** to only run exports (e.g. to test without R2).

## 5. Retention and lifecycle (optional)

R2 does not auto-delete objects. To avoid unbounded growth:

- In **R2** → your bucket → **Settings** → **Lifecycle rules**, add a rule to expire or delete objects under `backups/` after e.g. 30 or 90 days.
- Or periodically delete old prefixes (e.g. `backups/202501*`) manually or via a script.

## Troubleshooting

| Issue | Check |
|-------|--------|
| Workflow fails: "Supabase secrets required" | Ensure `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set and valid. |
| Workflow fails: "R2 backup requires..." | Add all four R2-related secrets; re-run. |
| Upload fails: 403 / Access Denied | Token must have **Object Read and Write** and be scoped to the bucket (or account). |
| Upload fails: endpoint / connection | Confirm `CLOUDFLARE_ACCOUNT_ID` is correct; endpoint is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. |
| Calendar export empty or errors | Service role key must be for the same project as `VITE_SUPABASE_URL`; check Supabase project is not paused. |

## Related

- [BACKUP_RESTORE.md](BACKUP_RESTORE.md) — Manual backup, PITR, restore.
- [SUPABASE_BACKUP_DATABASE.md](SUPABASE_BACKUP_DATABASE.md) — Backup Supabase project (recovery insurance).
