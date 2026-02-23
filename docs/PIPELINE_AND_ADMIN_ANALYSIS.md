# Pipeline & Admin Portal — Full Analysis

**Date:** February 22, 2026  
**Scope:** GitHub → Cloudflare deployment pipeline, admin login, and build failures

---

## Executive Summary

| Area | Status | Priority |
|------|--------|----------|
| **Workflow conflicts** | Two workflows deploy on push to `main` | High |
| **Admin login** | Root cause: Supabase unreachable (522/timeout) — infra, not code | High |
| **Build cache** | Cache key uses `github.sha` — never hits, adds noise | Medium |
| **Functions deployment** | `functions/` deployed with `dist` — verify in Cloudflare | Medium |
| **E2E tests** | May start local server unnecessarily in CI | Low |

---

## 1. Workflow Analysis

### Workflows That Run on Push to `main`

| Workflow | Trigger | Purpose | Conflict? |
|----------|---------|---------|------------|
| `cloudflare-pages.yml` | `push: main`, `pull_request: main` | Build + Deploy to Cloudflare Pages | Primary |
| `pages.yml` | `push: main` | Deploy to **GitHub Pages** | Yes — duplicates builds |

**Critical finding:** Both `cloudflare-pages.yml` and `pages.yml` run on every push to `main`. This causes:
- Two full builds per push
- Double CI time and potential confusion
- If GitHub Pages isn’t intended, `pages.yml` is redundant and may fail if env isn’t configured

**Recommendation:** If production is Cloudflare Pages only, disable or remove `pages.yml`, or change it to a different trigger (e.g. only for docs).

### Workflow Flow (cloudflare-pages.yml)

```
Checkout → npm ci → type-check → test → (db-audit skipped) → lint
  → Validate Supabase config → Build → Upload dist
    → [Deploy job] Download dist → wrangler pages deploy dist --project-name=lords-gym --branch=main
      → [E2E job] npm run test:e2e (continue-on-error)
```

### Other Workflows

- `deploy-staging.yml`: Runs on `push: develop` → GitHub Pages (staging)
- `deploy-cloudflare.yml`: Manual only (`workflow_dispatch`) — alternate deploy path; uses `cloudflare/pages-action@v1` vs `cloudflare/wrangler-action@v3` in main workflow

---

## 2. Build Configuration

### Build Steps That Can Fail

| Step | Command | Likely failure causes |
|------|---------|------------------------|
| type-check | `npm run type-check` | TypeScript errors |
| test | `npm run test` | Unit test failures |
| lint | `npm run lint` | Currently `echo 'No linter configured'` — always passes |
| Build | `npm run build` | Missing `VITE_SUPABASE_*` secrets, TS/build errors |

### Secrets Required for Build

| Secret | Required | Used for |
|--------|----------|----------|
| `VITE_SUPABASE_URL` | Yes (for production) | Supabase API URL at build time |
| `VITE_SUPABASE_ANON_KEY` | Yes | JWT anon key (must start with `eyJ`) |
| `VITE_ADMIN_ALLOWLIST_EMAILS` | Optional | Admin allowlist |
| `VITE_BREAK_GLASS_ADMIN_EMAIL` | Optional | Break-glass admin |
| `VITE_ADMIN_OAUTH_REDIRECT_URL` | Optional | OAuth redirect |
| `CLOUDFLARE_API_TOKEN` | Yes (deploy) | Deploy to Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Yes (deploy) | Cloudflare account |

### Build Cache Issue

```yaml
key: ${{ env.CACHE_KEY_PREFIX }}-build-${{ github.sha }}
restore-keys: ${{ env.CACHE_KEY_PREFIX }}-build-
```

**Problem:** Cache key includes `github.sha`, so each commit gets a unique key. Restore effectively never hits; every build is a cache miss.

**Recommendation:** Cache build output by `hashFiles('**/*.ts', '**/*.tsx', '**/vite.config.ts')` instead of SHA, or remove the build cache step.

---

## 3. Admin Login — Root Cause & Code

### Root Cause (from ADMIN_LOGIN_ROOT_CAUSE_ANALYSIS.md)

- Supabase project is `ACTIVE_HEALTHY` (verified via API)
- Auth gateway (`/auth/v1/health`) responds
- DB-dependent requests (login, REST) **time out**
- Likely: connection pooler/DB path unreachable from your network, or regional routing (us-west-2)

So the admin login issues are **infrastructure/network**, not logic bugs in the app.

### Code Flow (lib/auth.ts, AuthContext)

1. Direct Supabase (`signInWithPassword`)
2. Proxy via Cloudflare (`/api/auth-login`) when direct fails
3. Production fallback for known admin when both fail
4. Login timeout: 15s; session check: 3s

### Requirements for Admin Login to Work

1. **Build-time:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in GitHub Secrets
2. **Runtime:** `functions/api/auth-login.ts` deployed with Cloudflare Pages
3. **Cloudflare env (optional):** Function reads `context.env.VITE_SUPABASE_*` — set in Pages project if needed
4. **Network:** Supabase reachable from user and from Cloudflare edge

### If Build Has No Supabase Secrets

- `getAnonKey()` returns `''`
- `getSupabase()` uses `mockClient` → "Supabase not configured"
- User sees “paste anon key below” — config override is the intended recovery path

---

## 4. Cloudflare Pages Deployment

### Deploy Command

```bash
wrangler pages deploy dist --project-name=lords-gym --branch=main
```

- Run from repo root (after checkout)
- `dist/` from artifact (build output)
- `functions/` from checkout (Pages Functions)

Per Cloudflare docs, `functions/` must be at project root alongside `dist`. Current layout:

```
repo/
  dist/          ← artifact (uploaded)
  functions/
    api/
      auth-login.ts
```

This should work. Verify in Cloudflare: Workers & Pages → lords-gym → Functions → `api/auth-login` exists.

### Branch and Environment

- `--branch=main` must match the project’s production branch in Cloudflare.
- If mismatched, deploys appear as **Preview** and production never updates.
- See `DEBUG_DEPLOY.md` for detailed checks.

---

## 5. E2E Tests

### Configuration (playwright.config.ts)

```ts
const useLocalServer = !!process.env.PLAYWRIGHT_BASE_URL;
webServer: useLocalServer ? { command: 'npm run preview', ... } : undefined
```

In CI, `PLAYWRIGHT_BASE_URL=https://lords-gym.pages.dev` is set, so `useLocalServer` is `true` and a local preview server is started. E2E then run against `baseURL` (the production URL). That means:

- Local server runs but is not used
- Tests hit the deployed site — correct
- Unnecessary `npm run preview` in CI — minor cost

---

## 6. Checklist: Fixing Failed Builds

### Immediate actions

1. **GitHub Actions:**
   - Confirm `cloudflare-pages.yml` runs and passes for recent pushes.
   - Check the latest run’s Build job for type-check, test, or build errors.

2. **Secrets:**
   - [ ] `VITE_SUPABASE_URL`
   - [ ] `VITE_SUPABASE_ANON_KEY` (JWT starting with `eyJ`)
   - [ ] `CLOUDFLARE_API_TOKEN`
   - [ ] `CLOUDFLARE_ACCOUNT_ID`

3. **Workflow cleanup:**
   - Disable or remove `pages.yml` if Cloudflare is the only production host.

### Admin login (when builds succeed)

1. **Config override on admin page:** Paste URL and anon key from Supabase Dashboard (Settings → API).
2. **Different network:** Mobile hotspot or VPN if local network blocks Supabase.
3. **Supabase:** Contact support about project `mrptukahxloqpdqiaxkb` and DB/connection pooler timeouts.

---

## 7. File Reference

| File | Purpose |
|------|---------|
| `.github/workflows/cloudflare-pages.yml` | Main build + deploy |
| `.github/workflows/pages.yml` | GitHub Pages (duplicate on `main`) |
| `context/AuthContext.tsx` | Auth state, login, session |
| `lib/auth.ts` | signIn, signOut, getCurrentUser, proxy fallback |
| `lib/supabase.ts` | Supabase client, config overrides |
| `functions/api/auth-login.ts` | Auth proxy for Cloudflare edge |
| `pages/Admin.tsx` | Admin UI, login form, config override |
| `docs/ADMIN_LOGIN_ROOT_CAUSE_ANALYSIS.md` | Root cause analysis |
| `docs/ADMIN_LOGIN_WORKAROUNDS.md` | User-facing steps |
| `docs/DEBUG_DEPLOY.md` | Deploy troubleshooting |

---

## 8. Summary of Recommendations

| # | Action |
|---|--------|
| 1 | Disable or remove `pages.yml` if Cloudflare Pages is the only production host |
| 2 | Fix or remove build cache (avoid `github.sha` in cache key) |
| 3 | Confirm GitHub Secrets are set and that anon key is JWT format |
| 4 | In Cloudflare, verify `functions/api/auth-login` is deployed |
| 5 | For admin login: use config override on admin page or try different network |
| 6 | Optional: contact Supabase about project connectivity timeouts |
