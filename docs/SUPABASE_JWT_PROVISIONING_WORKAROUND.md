# Supabase JWT / Provisioning Script Workaround

**When:** `node scripts/complete-supabase-with-service-key.js` fails with **"signature verification failed"** or **"Invalid API key"** on a new or backup Supabase project.

**Why:** New Supabase projects use JWT signing keys that can differ from the keys shown in the dashboard. If the anon/service_role keys in `.env.local` were generated with a different secret (e.g. legacy vs. new ECC keys), the project’s API will reject them. This is a server-side verification issue, not a bug in the script.

---

## Fix A — Use keys that match this project

1. Open the project: **Dashboard** → your project (e.g. backup).
2. Go to **Settings** → **API** (or **JWT / API Keys**).
3. Copy the **anon** and **service_role** keys. Prefer keys that look like JWTs (`eyJ...`), not `sb_publishable_...` / `sb_secret_...` if the script expects JWTs.
4. Update `.env.local`:
   - `VITE_SUPABASE_URL` = project URL
   - `VITE_SUPABASE_ANON_KEY` = anon key from step 3
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key from step 3
5. Run again: `node scripts/complete-supabase-with-service-key.js`

If it still fails with the same errors, use **Fix B**.

---

## Fix B — Manual provisioning (no script)

Do the same steps the script would do, in the dashboard:

1. **Storage** → **New bucket** → name: `media` → Public → Create.
2. **Authentication** → **Users** → **Add user** → create your admin (email + password). Confirm email if required.
3. **Authentication** → **URL Configuration** → set **Site URL** and **Redirect URLs** for production.
   - **Site URL:** `https://lordsgymoutreach.com` only (no `#`, no `/**`).
   - **Redirect URLs:** add `https://lordsgymoutreach.com` and `https://lordsgymoutreach.com/**`. Do not add `https://lordsgymoutreach.com/#/**` or the home page can show `...#/**` after auth redirects.

After this, the app can use the project; keep `.env.local` pointing at this project’s URL and keys.

---

## Related

- [SUPABASE_BACKUP_DATABASE.md](SUPABASE_BACKUP_DATABASE.md) — Backup project setup
- [BACKUP_RESTORE.md](BACKUP_RESTORE.md) — General backup/restore
