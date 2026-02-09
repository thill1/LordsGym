# GitHub → Cloudflare Pages Setup & Test

Step-by-step guide to configure and test automated deployment from GitHub to Cloudflare.

## Quick start

```bash
npm run setup:cloudflare
```

This runs the setup script to verify prerequisites and build.

---

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
2. **New repository secret** for each (all 5 required):

| Secret | Value | Used for |
|--------|-------|----------|
| `CLOUDFLARE_API_TOKEN` | Token from step 1 | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from step 2 | Deploy to Cloudflare Pages |
| `VITE_SUPABASE_URL` | `https://mrptukahxloqpdqiaxkb.supabase.co` | Build (admin auth) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key from [API settings](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api) | Build (admin auth) |
| `GITHUB_TOKEN` | *(auto-provided)* | Deploy status |

**If deploy fails:** Check all 5 secrets exist. Redeploy after adding.

---

## 4. Create Cloudflare Pages Project (if needed)

If the project `lords-gym-auburn` doesn't exist:

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
2. **Connect to Git** (optional) or **Direct Upload**
3. Project name: `lords-gym-auburn`

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
| Deploy fails: project not found | Create project `lords-gym-auburn` in Cloudflare Pages first |
| Assets 404 | Ensure `VITE_BASE_PATH=/` in build (workflow sets this) |
