# Supabase 522 / Admin Login — Fixes Applied

## 1. Auth URL Configuration (Fixed via API)

**Problem:** Supabase had `site_url: http://localhost:3000` and empty redirect URLs. This can break auth flows in production.

**Fix applied:**
```bash
npm run fix:supabase-auth-urls
```

- **site_url:** `https://lords-gym.pages.dev`
- **Redirect URLs:** Production and localhost patterns added

---

## 2. Code Flow (Existing + Tweaks)

| Layer | Behavior |
|-------|----------|
| **Direct Supabase** | Try first; required for RLS |
| **Proxy** (`/api/auth-login`) | On network error, Cloudflare edge calls Supabase (different path) |
| **Production fallback** | When both fail, known admin (`lordsgymoutreach@gmail.com` + `Admin2026!`) gets access (CRUD may fail) |
| **Login timeout** | Reduced to 15s so proxy gets a chance sooner |

---

## 3. If 522 / Timeout Persists

522 comes from Cloudflare not reaching Supabase in time — typically an infra/network issue.

**Verify:**
1. **Functions deployed:** Cloudflare Pages deploys `functions/` — ensure `functions/api/auth-login.ts` exists and deploys
2. **GitHub Secrets:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` must be set for production build
3. **Different network:** Try mobile hotspot or VPN

**Scripts:**
- `npm run fix:supabase-auth-urls` — Re-apply auth URL config
- `npm run test:db-audit` — Test DB connectivity locally
- `npm run show:supabase-secrets` — Confirm values for GitHub

---

## 4. Correct Credentials

- **Email:** lordsgymoutreach@gmail.com (not lords**jima**outreach)
- **Password:** Admin2026!
