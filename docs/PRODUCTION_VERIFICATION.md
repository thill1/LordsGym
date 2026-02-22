# Production Verification Checklist

Use this checklist to verify admin login and product CRUD work in production.

## Prerequisites

1. **GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `VITE_SUPABASE_URL` – e.g. `https://mrptukahxloqpdqiaxkb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` – from [Supabase API settings](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api)

2. **Admin credentials** (set via `npm run set-admin-password`):
   - Email: `lordsgymoutreach@gmail.com`
   - Password: `Admin2026!`

## 1. Set admin password (one-time)

```bash
npm run set-admin-password
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Get it from Supabase Dashboard → Settings → API.

## 2. Deploy to production

Push to `main` branch. Cloudflare Pages will build and deploy. The build bakes `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from GitHub Secrets into the app.

## 3. Admin login

1. Go to `https://lordsgymoutreach.com/#/admin` (or your production URL)
2. If you see **"Supabase not configured"** and the paste-anon-key section:
   - Copy your [Supabase anon key](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api)
   - Paste it in the field and click **Save anon key & retry**
   - This stores the key in the browser for this session
3. Sign in with:
   - Email: `lordsgymoutreach@gmail.com`
   - Password: `Admin2026!`

## 4. Product CRUD verification

After logging in:

1. Open **Store** in the admin sidebar
2. **Create**: Click "Add New Product", fill in title/price/category, save
3. **Read**: Confirm the new product appears in the table
4. **Update**: Edit the product (change title or price), save
5. **Delete**: Delete the test product, confirm it disappears

Product changes persist to Supabase. RLS requires an authenticated session (from admin login).

## 5. Local e2e test (optional)

```bash
node --env-file=.env.local scripts/run-e2e-with-env.mjs e2e/admin-product-delete-persistence.spec.ts
```

Uses `lordsgymoutreach@gmail.com` and `Admin2026!` by default. Requires `PLAYWRIGHT_BASE_URL` for local testing (e.g. `http://localhost:4173`).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Admin login not configured" | Add `VITE_SUPABASE_ANON_KEY` to GitHub Secrets and redeploy, or paste anon key in the login form |
| "Invalid email or password" | Run `npm run set-admin-password` to reset password to Admin2026! |
| Product save fails | Ensure you're logged in (Supabase auth session required for RLS) |
| Products not loading | Check Supabase URL and anon key; verify products table exists and has correct schema |
