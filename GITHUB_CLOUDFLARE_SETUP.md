# GitHub → Cloudflare Pages Setup & Test

Step-by-step guide to configure and test automated deployment from GitHub to Cloudflare.

## Quick start

```bash
npm run setup:cloudflare
```

This runs the setup script to verify prerequisites and build.

---

**Exact steps:** See **[docs/CLOUDFLARE_SECRETS_STEPS.md](docs/CLOUDFLARE_SECRETS_STEPS.md)** for click-by-click Cloudflare token + Account ID and where to put secrets.

## 1. Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **My Profile** (top right) → **API Tokens**
3. **Create Token** → **Edit Cloudflare Workers** (or custom: add **Account** → **Cloudflare Pages** → **Edit**)
4. Copy the token (you won't see it again)

---

## 2. Cloudflare Account ID

1. In Cloudflare Dashboard, open any page
2. Right sidebar → **Account ID** (copy it)

---

## 3. GitHub Secrets (required for deploy)

1. Repo: **Settings** → **Secrets and variables** → **Actions**
2. Add **Repository secrets** (not only environment-specific): **New repository secret** for each:

| Secret | Value | Used for |
|--------|-------|----------|
| `CLOUDFLARE_API_TOKEN` | Token from step 1 | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from step 2 | Deploy to Cloudflare Pages |
| `VITE_SUPABASE_URL` | `https://mrptukahxloqpdqiaxkb.supabase.co` | Build (admin auth) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key from [API settings](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api) | Build (admin auth) |
| `GITHUB_TOKEN` | *(auto-provided)* | Deploy status |
| `VITE_ADMIN_ALLOWLIST_EMAILS` | `owner@gmail.com,ops@gmail.com` | Google admin allowlist |
| `VITE_BREAK_GLASS_ADMIN_EMAIL` | `admin@lordsgym.com` | Password emergency login policy |
| `VITE_ADMIN_OAUTH_REDIRECT_URL` | `https://lordsgymoutreach.com/admin` | Optional OAuth callback override |

**Token permissions:** The Cloudflare API token must have **Account** → **Cloudflare Pages** → **Edit**. If deploy fails with 403, create a new token with that permission.

**If deploy fails:** Check all 5 secrets exist under **Actions** (repository secrets). Redeploy after adding.

**Set Cloudflare secrets via API (no UI):** Add to `.env.local`: `GITHUB_TOKEN` (PAT with repo + Actions secrets), `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Then run:

```bash
npm install
npm run set:cloudflare-secrets
```

This uses the GitHub REST API to create/update the two repository secrets. Then re-run the failed workflow or push to trigger deploy.

---

## 4. Create Cloudflare Pages Project (if needed)

If the project `lords-gym` doesn't exist:

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
2. **Connect to Git** (optional) or **Direct Upload**
3. Project name: `lords-gym`

Or skip: the first deploy via workflow may create it.

---

## 5. Test locally (optional)

```bash
CLOUDFLARE_API_TOKEN=your_token CLOUDFLARE_ACCOUNT_ID=your_id npm run deploy:cloudflare
```

Or add to `.env.local` (gitignored) and run:

```bash
source .env.local && npm run deploy:cloudflare
```

---

## 6. Deploy via GitHub

**Option A: Push to main**

```bash
git add -A
git commit -m "Deploy to Cloudflare"
git push origin main
```

**Option B: Manual workflow run**

1. **Actions** → **Deploy to Cloudflare Pages**
2. **Run workflow** → **Run workflow**

---

## 7. Verify

After deploy, visit: [https://lordsgymoutreach.com](https://lordsgymoutreach.com/) (production) or `lords-gym.pages.dev` (preview)

---

. ## 8. DNS (Custom Domain)

Add DNS records via API—no browser needed. Token needs **Zone → DNS → Edit**.

```bash
# Add CLOUDFLARE_API_TOKEN to .env.local first

# Point root (lordsgymoutreach.com) to Cloudflare Pages
node scripts/cloudflare-dns.js lordsgymoutreach.com CNAME @ lords-gym.pages.dev true

# Point www to Cloudflare Pages
node scripts/cloudflare-dns.js lordsgymoutreach.com CNAME www lords-gym.pages.dev true
```

Then add the custom domain in Cloudflare Pages → Custom domains.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Configuration file for Pages projects does not support 'build'" | Remove custom deploy command from Cloudflare dashboard. Use Build command + Output directory only. Cloudflare deploys automatically. |
| Build fails | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in secrets |
| Deploy fails: 403 | Verify `CLOUDFLARE_API_TOKEN` has Pages:Edit permission |
| Deploy fails: project not found | Create project `lords-gym` in Cloudflare Pages first |
| No new deploy on Cloudflare | See [DEBUG_DEPLOY.md](DEBUG_DEPLOY.md). 1) [Actions](https://github.com/thill1/LordsGym/actions) → open latest run → check **Deploy diagnostics** (secrets set?). 2) If deploy job shows **Waiting for approval**, go to **Settings → Environments → production** → Approve, or disable "Required reviewers". 3) Workflow uses `--branch=production` so deploy goes to Production. |
| Assets 404 | Ensure `VITE_BASE_PATH=/` in build (workflow sets this) |
