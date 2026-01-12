# GitHub Pages Troubleshooting Guide

## Current Configuration

- **Repository**: `thill1/LordsGym`
- **Expected URL**: `https://thill1.github.io/LordsGym/`
- **Base Path**: `/LordsGym/` (configured in `vite.config.ts`)
- **Workflow**: `.github/workflows/pages.yml`

## Steps to Fix GitHub Pages Deployment

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub: `https://github.com/thill1/LordsGym`
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: `GitHub Actions`
   - (NOT "Deploy from a branch")
4. Save the settings

### 2. Check Workflow Status

1. Go to **Actions** tab in your repository
2. Look for "Deploy to GitHub Pages" workflow
3. Check if it has run after your last commit
4. If it failed, click on it to see error messages

### 3. Manually Trigger Workflow (if needed)

1. Go to **Actions** tab
2. Click on "Deploy to GitHub Pages" workflow
3. Click **Run workflow** → **Run workflow** (button on the right)
4. This will trigger a new deployment

### 4. Verify Build Output

The build should create files in `dist/` with paths like:
- `/LordsGym/assets/index-*.js`
- `/LordsGym/assets/index-*.css`

### 5. Common Issues

#### Issue: 404 Page Not Found
- **Cause**: GitHub Pages not enabled or wrong source selected
- **Fix**: Enable GitHub Pages with "GitHub Actions" as source

#### Issue: White Blank Page
- **Cause**: JavaScript errors or incorrect base path
- **Fix**: Check browser console for errors, verify base path matches repo name

#### Issue: Assets Not Loading (404 on JS/CSS)
- **Cause**: Base path mismatch
- **Fix**: Ensure `vite.config.ts` has `base: "/LordsGym/"` for production

#### Issue: Workflow Not Running
- **Cause**: Workflow file not committed or permissions issue
- **Fix**: Ensure `.github/workflows/pages.yml` is committed to main branch

### 6. Verify Deployment

After enabling GitHub Pages and workflow runs successfully:
1. Wait 1-2 minutes for deployment to complete
2. Visit: `https://thill1.github.io/LordsGym/`
3. Check browser console (F12) for any errors

### 7. Check Workflow Logs

If workflow fails:
1. Go to **Actions** → Click on failed workflow run
2. Expand each step to see error messages
3. Common errors:
   - Build failures (check `npm run build` output)
   - Permission issues (check repository settings)
   - Environment not configured (check Pages settings)

## Current Status Check

Run these commands locally to verify:
```bash
# Check if workflow file exists
ls -la .github/workflows/pages.yml

# Build locally to verify
npm run build

# Check dist output
ls -la dist/
```

## Next Steps

1. **Enable GitHub Pages** in repository settings (most important!)
2. **Check Actions tab** to see if workflow ran
3. **Manually trigger** workflow if needed
4. **Wait for deployment** (usually 1-2 minutes)
5. **Visit the site** at `https://thill1.github.io/LordsGym/`
