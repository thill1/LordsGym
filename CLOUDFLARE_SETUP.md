# Cloudflare Pages Setup Guide

## Overview
This project is configured to automatically deploy to **Cloudflare Pages** whenever you push to the `main` branch.

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. CLOUDFLARE_API_TOKEN

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use the **"Cloudflare Pages"** template or create custom token with:
   - **Zone:Read** (for domain verification)
   - **Page:Edit** (for deploying pages)
4. Copy the token
5. Go to your GitHub repo → Settings → Secrets and variables → Actions
6. Click **"New repository secret"**
7. Name: `CLOUDFLARE_API_TOKEN`
8. Paste the token

### 2. CLOUDFLARE_ACCOUNT_ID

1. In Cloudflare Dashboard, look at the right sidebar on any domain
2. You'll see **"Account ID"** - copy it
3. Or go to: https://dash.cloudflare.com/ → right sidebar
4. Add as GitHub secret: `CLOUDFLARE_ACCOUNT_ID`

### 3. VITE_SUPABASE_URL (Optional)
If using Supabase features:
- Your Supabase project URL: `https://your-project.supabase.co`

### 4. VITE_SUPABASE_ANON_KEY (Optional)
If using Supabase features:
- Your Supabase anon/public key

## Alternative: Manual Cloudflare Pages Setup

If you prefer not to use GitHub Actions:

1. Go to https://dash.cloudflare.com/pages
2. Click **"Create a project"**
3. Connect to your GitHub repo
4. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`

## Deployment

### Automatic (GitHub Actions)
- Push to `main` branch → Auto-deploys to Cloudflare Pages
- Check progress in GitHub Actions tab

### Manual
```bash
git push origin main
```

## Domain Setup (Optional)

To use a custom domain:

1. In Cloudflare Pages dashboard → Your project → Custom domains
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `lordsgym.com`)
4. Follow DNS instructions

## Verify Deployment

Your site will be available at:
- `https://lords-gym-auburn.pages.dev` (default)
- Or your custom domain once configured

## Troubleshooting

**Build fails?**
- Check build logs in GitHub Actions
- Ensure all dependencies are in package.json
- Verify build works locally: `npm run build`

**Deployment fails?**
- Verify CLOUDFLARE_API_TOKEN is correct
- Check CLOUDDFLARE_ACCOUNT_ID is correct
- Ensure token has Page:Edit permissions

**Site not updating?**
- Check if Cloudflare Pages project name matches: `lords-gym-auburn`
- Verify dist folder is created in build

## Support

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- GitHub Actions: https://docs.github.com/en/actions
