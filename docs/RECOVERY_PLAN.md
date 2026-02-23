# Recovery Plan — Cloudflare, GitHub, Admin Access

**Date:** February 22, 2026  
**Status:** Triangulated from GitHub Actions logs, Cloudflare error, and Supabase root-cause docs

---

## Triangulation Summary

| Source | Finding |
|--------|---------|
| **Cloudflare** | "Build token selected for this build has been deleted or rolled" — Cloudflare's **Git integration build** fails on init |
| **GitHub Actions** | `cloudflare-pages.yml` succeeded at 06:04 and 06:14 today; earlier failures were **db audit** (Supabase 522) and quick failures (~34s) |
| **Supabase** | 522 from GitHub runners; project ACTIVE_HEALTHY but DB-dependent requests time out from some networks |

---

## Two Build Systems (Why the Confusion)

You have **two** ways builds can run:

| System | Where it runs | Trigger | Status |
|--------|---------------|---------|--------|
| **Cloudflare Git integration** | Cloudflare's servers | Push to connected repo | ❌ **Failing** — build token deleted/rolled (~9 days) |
| **GitHub Actions** (`cloudflare-pages.yml`) | GitHub runners | Push/PR to main | ✅ **Succeeding** (as of 06:14 today) |

The Cloudflare error you saw is from **Cloudflare's build** (when Cloudflare clones from GitHub and builds). That uses a **build token** stored in Cloudflare — separate from `CLOUDFLARE_API_TOKEN` in GitHub.

GitHub Actions builds **in GitHub** and then uploads `dist` via `wrangler pages deploy`. That does **not** use Cloudflare's build token.

---

## Step 1: Fix Cloudflare Build Token (or Bypass It)

### Option A: Update the token (if you use Cloudflare builds)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **lords-gym**
2. **Settings** → **Builds** (or **Build configuration**)
3. Find **Build token** / **OAuth** / **Git connection**
4. **Regenerate** or **reconnect** the GitHub connection / token
5. Retry a deployment (push a commit or use **Retry** on a failed build)

### Option B: Use only GitHub Actions (bypass Cloudflare build)

If Cloudflare is connected to GitHub and tries to build on every push, you can **disable Cloudflare's build** and rely on GitHub Actions:

1. Cloudflare → lords-gym → **Settings** → **Builds**
2. Set **Build command** to `exit 0` (no-op)
3. Set **Build output directory** to `dist`
4. Or: **Disconnect** the Git integration and use **Direct Upload** only — then GitHub Actions (wrangler) becomes the sole deployment path

**Verify:** After a successful GitHub Actions run, check Cloudflare → **Deployments**. You should see a new deployment from the wrangler upload (may show as "Direct Upload" or similar).

---

## Step 2: Admin Portal Access (Without Waiting for Supabase)

Your `.env.local` has valid Supabase credentials. Use the **config override** on the admin page:

1. Open **https://lords-gym.pages.dev/#/admin** (or your production URL)
2. On the login form, expand **Troubleshooting: Override Supabase config**
3. Paste:
   - **URL:** `https://mrptukahxloqpdqiaxkb.supabase.co`
   - **Anon key:** (from `.env.local` — the long `eyJ...` value)
4. Click **Save & retry**
5. Sign in with:
   - **Email:** `lordsgymoutreach@gmail.com` (not lordsjimaoutreach)
   - **Password:** `Admin2026!`

**If Supabase times out:** The app has a **production fallback** for this admin. After ~4–15 seconds, you get access with a warning banner. CRUD (products, calendar) may not work until Supabase is reachable, but you can at least access the admin UI.

**If still stuck:** Try a **different network** (mobile hotspot, VPN) — Supabase may be unreachable from your current ISP.

---

## Step 3: Ensure GitHub Secrets Are Set

For production builds to include Supabase config:

| Secret | Where | Purpose |
|--------|-------|---------|
| `VITE_SUPABASE_URL` | GitHub → Settings → Secrets | Build-time Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | GitHub → Secrets | JWT anon key (starts with `eyJ`) |
| `CLOUDFLARE_API_TOKEN` | GitHub → Secrets | Wrangler deploy |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub → Secrets | Cloudflare account |

To sync from `.env.local`:

```bash
npm run set:supabase-secrets    # If you have this script
npm run set:cloudflare-secrets  # For Cloudflare token/account
```

---

## Step 4: Confirm Latest Code Is Live

- **GitHub:** Latest successful run: `fix(deploy): skip db audit in CI` (run 22271808665, ~06:14 UTC)
- **Cloudflare Deployments:** Check that the most recent deployment is **Production** (not Preview) and matches that commit
- If deployments show **Preview** only, fix `--branch=main` in the workflow and project settings (see `DEBUG_DEPLOY.md`)

---

## Failure Timeline (from GitHub Actions)

| Period | Outcome |
|--------|---------|
| Feb 19 before 14:44 | Successes |
| Feb 19 14:44–15:04 | Failures (admin revert, TypeScript, google-reviews) |
| Feb 19 15:08+ | Successes |
| Feb 21 22:44 | Failure (Fix mobile/incognito — ~34s) |
| Feb 22 02:53–05:07 | Cascade of failures — **db audit** (Supabase 522) |
| Feb 22 06:04 | Success (db audit made non-blocking) |
| Feb 22 06:14 | Success (db audit fully skipped in CI) |

---

## Quick Recovery Checklist

- [ ] **Cloudflare:** Update build token or set build command to `exit 0` to bypass
- [ ] **Admin:** Use config override with URL + anon key from `.env.local`; try different network if needed
- [ ] **GitHub Secrets:** Confirm `VITE_SUPABASE_*` and `CLOUDFLARE_*` are set
- [ ] **Deploy:** Push a small change and confirm GitHub Actions succeeds → check Cloudflare Deployments for new production deploy

---

## Nuclear Option: Deploy Locally (Bypass Everything)

If both Cloudflare and GitHub Actions are stuck, deploy directly from your machine:

1. **Authenticate wrangler** (one-time): `npx wrangler login`
2. **Build with Supabase config** (copy URL and anon key from `.env.local`):
   ```powershell
   cd c:\Users\troyh\LordsGym
   $env:VITE_BASE_PATH="/"
   $env:VITE_SUPABASE_URL="https://mrptukahxloqpdqiaxkb.supabase.co"
   $env:VITE_SUPABASE_ANON_KEY="<paste from .env.local>"  # long eyJ... token
   npm run build
   ```
3. **Deploy:** `npx wrangler pages deploy dist --project-name=lords-gym`

This uploads `dist` and `functions/` directly to Cloudflare — no GitHub, no Cloudflare build token.

---

## Related Docs

- `ADMIN_LOGIN_ROOT_CAUSE_ANALYSIS.md` — Supabase 522 / network
- `ADMIN_LOGIN_WORKAROUNDS.md` — Config override steps
- `DEBUG_DEPLOY.md` — Cloudflare deploy troubleshooting
- `PIPELINE_AND_ADMIN_ANALYSIS.md` — Full pipeline analysis
