# Bring Backup Database Online

Use this when switching the app to the backup Supabase project (`ktzvzossoyyfvexkgagm`).  
Migrations are already applied on the backup. You will manually re-enter data that cannot be recreated from code.

---

## 1. Backup .env.local (done)

A timestamped copy was created:

- `supabase-rebuild-lordsgym/exports/.env.local.YYYYMMDD-HHmmss.backup`

---

## 2. Get backup project keys

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **ktzvzossoyyfvexkgagm** (Lords Gym Backup).
2. Go to **Settings → API**.
3. Copy:
   - **Project URL** (e.g. `https://ktzvzossoyyfvexkgagm.supabase.co`)
   - **anon public** key
   - **service_role** key (secret)

---

## 3. Point app at backup project

In LordsGym **`.env.local`**, set:

```env
VITE_SUPABASE_URL=https://ktzvzossoyyfvexkgagm.supabase.co
VITE_SUPABASE_ANON_KEY=<paste anon key from dashboard>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key from dashboard>
```

Keep `SUPABASE_ACCESS_TOKEN` as-is (same account). Save the file.

---

## 4. Provision backup project (storage + admin)

From LordsGym root, either:

**Option A — After updating .env.local (Step 3):**

```powershell
node scripts/complete-supabase-with-service-key.js
```

**Option B — Without editing .env.local** (run with backup keys in env for this command only):

```powershell
$env:VITE_SUPABASE_URL = "https://ktzvzossoyyfvexkgagm.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "<your backup anon key>"
$env:SUPABASE_SERVICE_ROLE_KEY = "<your backup service_role key>"
node scripts/complete-supabase-with-service-key.js
```

This creates the **media** bucket, a placeholder admin user, and verifies DB/storage. Save any admin password it prints if you use that user.

---

## 5. Auth configuration (backup project)

In the **backup** project dashboard:

1. **Auth → URL Configuration**
   - **Site URL:** `https://lords-gym.pages.dev` or `https://lordsgymoutreach.com`
   - **Redirect URLs:** Add your production URLs (e.g. `https://lords-gym.pages.dev/**`, `https://lordsgymoutreach.com/**`).
2. **Auth → Users**
   - Create or confirm your real admin user (e.g. lordsgymoutreach@gmail.com) and set password, or use `scripts/set-admin-password.js` / `scripts/create-admin-user.js` with backup env loaded.

---

## 6. Manual data re-entry

These are not recreated from code. Re-enter or re-import as needed in Admin or via SQL.

| Data | Where to re-enter | Notes |
|------|-------------------|--------|
| **Settings** | Admin → Settings | Site name, contact email/phone, address, announcement bar, popup modals, etc. |
| **Home content** | Admin → Home | Hero, values, any custom blocks. |
| **Products** | Admin → Store | Products catalog (title, price, image, category, etc.). |
| **Testimonials** | Admin → Testimonials | Quotes, names, roles; re-import Google Reviews if you use that. |
| **Pages** | Admin → Pages | Custom pages (slug, title, content, meta). |
| **Calendar** | Admin → Calendar | Recurring patterns and one-off events; bookings if you had any. |
| **Media** | Admin → Media | Re-upload images/files used by pages/products, or restore from backup. |
| **Auth users** | Supabase Auth → Users (or scripts) | Admin and any other users; set passwords. |
| **SEO / Schema** | Admin → SEO | If you had custom SEO or schema markup. |

Anything stored only in the old DB (and not exported) must be re-created manually or from your own backups.

---

## 7. Deploy

1. **GitHub secrets** (if CI/CD deploys the site):  
   Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the backup project values.
2. **Supabase Edge Functions** (if you use contact-form, stripe-checkout, etc.):  
   In the **backup** project, set the same secrets (e.g. Resend, Stripe) so functions work.
3. Trigger deploy (e.g. push to `main` or run your deploy workflow).

---

## 8. Smoke test

- [ ] Admin login
- [ ] Store (products, cart if applicable)
- [ ] Calendar (recurring events, bookings)
- [ ] Contact form
- [ ] Public pages and media

---

## Rollback

To switch back to the primary project, restore `.env.local` from the backup file in `supabase-rebuild-lordsgym/exports/`, update GitHub secrets to primary keys, and redeploy. See `supabase-rebuild-lordsgym/checklists/rollback.md`.
