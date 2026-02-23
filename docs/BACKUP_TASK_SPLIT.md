# Backup going live — task split (CLI vs you)

Backup project ref: **ktzvzossoyyfvexkgagm**

---

## My tasks (CLI)

| # | Task | Command / action |
|---|------|-------------------|
| 1 | Backup `.env.local` | `supabase-rebuild-lordsgym\scripts\powershell\01_backup_env.ps1` |
| 2 | Export schema to rebuild workspace | `node supabase-rebuild-lordsgym/scripts/node/02_export_schema.js` |
| 3 | Link Supabase CLI to backup project | `npx supabase link --project-ref ktzvzossoyyfvexkgagm` (from LordsGym root) |
| 4 | Provision backup (storage + default admin) | **After you update .env.local** — `node scripts/complete-supabase-with-service-key.js` |
| 5 | Create/set admin user on backup | **After step 4 and .env points to backup** — you run: `npm run set-admin-password` or `npm run create-admin` (you supply email/password) |

---

## Your tasks (manual)

| # | Task | Where / how |
|---|------|-------------|
| 1 | Get backup API keys | Supabase Dashboard → project **ktzvzossoyyfvexkgagm** → **Settings → API**. Copy: Project URL, anon key, service_role key. |
| 2 | Point app at backup | In LordsGym **.env.local** set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to backup values. Save. |
| 3 | Tell me when .env is updated | So I can run step 4 (provision backup) and, if you want, step 5. |
| 4 | Auth URL config (backup project) | Dashboard → **Auth → URL Configuration**: set Site URL and Redirect URLs for production. |
| 5 | Set admin password (if not using script) | Dashboard → **Auth → Users** → create/edit user, set password. Or run `npm run set-admin-password` after .env points to backup. |
| 6 | GitHub secrets | Repo **Settings → Secrets and variables → Actions**: update `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` to backup values. |
| 7 | Edge Function secrets (if used) | In **backup** project: **Settings → Edge Functions** (or Functions) → set secrets (e.g. Resend, Stripe) so contact-form / stripe-checkout work. |
| 8 | Deploy | Push to `main` or run your deploy workflow so the site uses the new build with backup env. |
| 9 | Manual data re-entry | Per [BACKUP_GOING_LIVE.md](BACKUP_GOING_LIVE.md): Settings, Home, Products, Testimonials, Pages, Calendar, Media, Auth users, SEO. |

---

## Order of operations

1. **Me:** 1, 2, 3 (backup env, export schema, link CLI to backup).
2. **You:** 1, 2 (get keys, update .env.local).
3. **You:** Tell me .env is updated.
4. **Me:** 4 (run `complete-supabase-with-service-key.js`).
5. **You:** 4, 5 (Auth URL config, admin user).
6. **Me (optional):** 5 — run `npm run set-admin-password` or `npm run create-admin` if you want admin created from CLI.
7. **You:** 6, 7, 8 (GitHub secrets, Edge Function secrets, deploy).
8. **You:** 9 (manual data re-entry in Admin).

---

## Quick reference — commands I run from LordsGym root

```powershell
# Already done / I will run:
cd c:\Users\troyh\LordsGym
.\supabase-rebuild-lordsgym\scripts\powershell\01_backup_env.ps1
node supabase-rebuild-lordsgym/scripts/node/02_export_schema.js
npx supabase link --project-ref ktzvzossoyyfvexkgagm

# After you update .env.local with backup keys:
node scripts/complete-supabase-with-service-key.js

# Optional (you provide email/password or run yourself):
npm run set-admin-password
# or
npm run create-admin
```
