# 🚀 Quick Deploy Guide - Lords Gym

> Get your site live in 2 minutes (manual) or set up auto-deploy once (GitHub Actions)

---

## ⚡ Fastest Option: Manual Deploy (2 minutes)

**Best for:** First deploy, quick fixes, or when CI/CD isn't set up yet

### Steps:

1. **Go to Cloudflare Pages**
   - Open <https://dash.cloudflare.com/pages>
   - Sign in with your Cloudflare account

2. **Connect GitHub Repo**
   - Click **"Create a project"**
   - Select **"Connect to Git"**
   - Authorize Cloudflare to access your GitHub repos
   - Choose your **LordsGym** repository

3. **Configure Build Settings**
   
   | Setting | Value |
   |---------|-------|
   | **Project name** | `lords-gym` (or your choice) |
   | **Production branch** | `main` |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |

4. **Click "Save and Deploy"**
   - Cloudflare will build and deploy your site
   - You'll get a URL like `lords-gym.pages.dev`

5. **Done!** 🎉
   - Your site is live
   - Custom domain? Go to **Custom domains** tab → Add your domain

---

## 🤖 GitHub Actions Option (Automated)

**Best for:** Ongoing development, team workflows, auto-deploy on push

### Step 1: Get Your Cloudflare Credentials

#### Get `CLOUDFLARE_API_TOKEN`:
1. Go to <https://dash.cloudflare.com/profile/api-tokens>
2. Click **"Create Token"**
3. Select **"Custom token"**
4. Set permissions:
   - **Zone:Zone:Read** (for finding zones)
   - **Zone:Page Rules:Edit** (optional)
   - **Account:Cloudflare Pages:Edit** ⭐ REQUIRED
5. **Account Resources:** Include → YOUR_ACCOUNT
6. **Zone Resources:** Include → All zones (or specific zone)
7. Click **"Continue to summary"** → **"Create token"**
8. **COPY THE TOKEN NOW** (you won't see it again!)

#### Get `CLOUDFLARE_ACCOUNT_ID`:
1. Go to any domain in your Cloudflare dashboard
2. Look at the right sidebar → **"API"** section
3. Copy the **"Zone ID"** value

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add both secrets:
   - `CLOUDFLARE_API_TOKEN` → paste your token
   - `CLOUDFLARE_ACCOUNT_ID` → paste your account ID

### Step 3: Create the Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: lords-gym  # Change to your project name
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Step 4: One-Click Deploy

✅ **Done!** Every push to `main` will auto-deploy.

- Check progress in **Actions** tab on GitHub
- Deploy preview on PRs (optional but nice!)

---

## 🛠️ Troubleshooting

### Build Fails

| Symptom | Fix |
|---------|-----|
| `npm ERR! missing script: build` | Check `package.json` has `"build": "..."` script |
| `Module not found` | Run `npm install` locally, commit `package-lock.json` |
| Build succeeds but empty site | Check **Build output directory** is `dist` (or your actual output folder) |
| Out of memory | Add `NODE_OPTIONS=--max-old-space-size=4096` before build command |
| Timeout | Increase build time limit in Cloudflare Pages settings (10min default) |

**Quick checks:**
```bash
# Test build locally first
npm ci
npm run build
# Check dist/ folder exists and has files
ls -la dist/
```

### 404 Errors

| Cause | Solution |
|-------|----------|
| Page not found on refresh | Add `_redirects` or `public/_redirects` with: `/* /index.html 200` |
| Assets 404 (CSS/JS) | Check `base` config in vite.config.js - should match your deploy path |
| Wrong folder deployed | Verify build output directory points to correct folder |
| SPA routing issues | Ensure catch-all redirect is configured |

**For SPAs (React/Vue/Svelte), add to `public/_redirects`:**
```
/* /index.html 200
```

### Environment Variables Not Working

| Issue | Fix |
|-------|-----|
| `process.env` undefined | Use `import.meta.env` (Vite) or check bundler docs |
| Vars missing in build | Add to Cloudflare Pages → Settings → Environment variables |
| Secret exposed in client | Only vars prefixed with `VITE_` (or equivalent) go to client |
| Build-time vs Runtime | Cloudflare Pages uses build-time vars; Workers use runtime vars |

**To add env vars in Cloudflare:**
1. Go to your Pages project → **Settings** → **Environment variables**
2. Click **"Add variable"**
3. Add key/value pairs
4. **Redeploy** (env vars are injected at build time)

**Vite projects - use these prefixes:**
- `VITE_` prefix = exposed to client-side code
- No prefix = server/build only

---

## 📋 Quick Reference

| What | Where |
|------|-------|
| Cloudflare Dashboard | <https://dash.cloudflare.com> |
| Pages Dashboard | <https://dash.cloudflare.com/pages> |
| API Tokens | <https://dash.cloudflare.com/profile/api-tokens> |
| GitHub Actions | Repo → Actions tab |
| Secrets | Repo → Settings → Secrets and variables → Actions |

---

## ✅ Pre-Deploy Checklist

- [ ] `npm run build` works locally
- [ ] `dist/` folder exists after build
- [ ] All environment variables set (if needed)
- [ ] `_redirects` file added for SPAs
- [ ] GitHub secrets configured (for CI/CD)
- [ ] Tested on preview URL before going live

---

**Need help?** Check [Cloudflare Pages docs](https://developers.cloudflare.com/pages/) or your build tool's deployment guide.
