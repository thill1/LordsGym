# Debug: Why isn’t my deploy showing on Cloudflare?

Use this when **pushes to `main` don’t show up as new production deployments** on Cloudflare (lords-gym / lordsgymoutreach.com).

**Check first:** In Cloudflare → Workers & Pages → lords-gym → **Deployments**, look at new runs. If they say **Preview** instead of **Production**, the workflow’s `--branch` is wrong (use `--branch=main`). That single mismatch causes “build passed” but the live site never updating.

**Why it's confusing:** GitHub Actions run numbers (e.g. Deploy to Cloudflare Pages #18, #19…) go up every time the workflow runs and can all be green. That only means "build and deploy step succeeded." It does *not* mean the production URL updated — those runs were creating **Preview** deployments. To confirm the live site updated, check Cloudflare Deployments and that the latest run is **Production**, not Preview.

---

## 1. How the pipeline works

| Step | What happens |
|------|-------------------------------|
| **Trigger** | Push to `main` or PR to `main` (or manual “Run workflow”). |
| **Build job** | Checkout → `npm ci` → `npm run build` (needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Uploads `dist` as artifact. |
| **Deploy job** | Runs only when **not** a PR (or PR from same repo). Uses GitHub **environment** `production`. Downloads `dist` → runs `wrangler pages deploy dist --project-name=lords-gym --branch=main`. |

If the deploy job never runs, or runs but doesn’t reach the “Deploy to Cloudflare Pages” step, nothing will appear on Cloudflare.

---

## 2. Checklist (in order)

### A. Did the workflow run?

- Go to [Actions](https://github.com/thill1/LordsGym/actions) and open the latest **“Deploy to Cloudflare Pages”** run for your push.
- If there is **no run** for your commit: push might be on a different branch, or the workflow file isn’t on the default branch.

### B. Did the Build job succeed?

- If **Build** is red: fix the error (often missing or wrong `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in repo Secrets). The deploy job only runs after a successful build.

### C. Did the Deploy job run or is it waiting?

- If the **Deploy** job shows **“Waiting for approval”** (or similar): the job uses the GitHub **environment** named `production`. If that environment has **Required reviewers**, the job will not run until someone approves.
  - **Fix:** Repo **Settings → Environments → production** → either **Approve** the pending deployment, or **remove “Required reviewers”** so future deploys don’t wait.
- If **Deploy** is **skipped**: on **pull_request** events the deploy job is skipped by design (only PR previews get a deploy). Push to `main` to get a production deploy.

### D. Did the Deploy step actually run?

- Open the **Deploy to Cloudflare Pages** job and look for the **“Deploy diagnostics”** step. It prints (without exposing secrets):
  - `CLOUDFLARE_API_TOKEN`: set / NOT SET  
  - `CLOUDFLARE_ACCOUNT_ID`: set / NOT SET  
  - The exact `wrangler` command.
- If either secret is **NOT SET**, the next step (“Deploy to Cloudflare Pages”) will fail. Add the missing repo Secrets under **Settings → Secrets and variables → Actions** and re-run or push again.
- If both are **set** but the **“Deploy to Cloudflare Pages”** step is red, read the error in the log (wrong project name, 403, network, etc.).

### E. Is the deploy going to the right place?

- Workflow uses: `--project-name=lords-gym --branch=main`.
- **Project:** Must match the Cloudflare Pages project name (e.g. **lords-gym** in Workers & Pages). If it was wrong (e.g. `lords-gym-auburn`), deploys would go to a different project and you wouldn’t see them on lordsgymoutreach.com.
- **Branch (critical):** `--branch` must match the project production branch in Cloudflare (here: **main**). Wrong branch makes deploys show as Preview; live site never updates. So `--branch=main` sends the deploy to **Production**. If your project’s production branch is `main`, change the workflow to `--branch=main`.

---

## 3. Lessons learned (for this repo)

| Issue | Cause | Fix |
|-------|--------|-----|
| **Deployments show “Preview” and prod URL never updates** | `--branch` in wrangler didn’t match the project’s **production branch**. This repo’s project uses **main** as production; we had `--branch=main`, so every deploy went to a “production” branch and showed as Preview. | Use `--branch=main` in the deploy command. **First thing to check when “build passed” but prod didn’t: Cloudflare Deployments tab — are new runs Preview or Production?** |
| No new deploy on Cloudflare for 15+ hours | Workflow was deploying to **wrong project** (`lords-gym-auburn` instead of **lords-gym**). | Use `--project-name=lords-gym` to match the dashboard project. |
| Deploy job green but nothing on Cloudflare | Deploy job might be **waiting for environment approval**; or deploy went to Preview (wrong `--branch`). | Approve in **Environments → production**; or fix `--branch=main`. |
| Deploy step fails with 403 / auth error | Missing or invalid `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`; or token lacks permission. | Add as **Repository secrets**. Token needs **Account** → **Cloudflare Pages** → **Edit**. |
| "CLOUDFLARE_API_TOKEN is not set" (fail-fast) | Secret not added or only in environment. | Add both as **Repository secrets**. Use `npm run set:cloudflare-secrets` with `.env.local` (exact `KEY=value`, no spaces around `=`). |
| Deploy step fails: project not found | Project name in workflow doesn’t match Cloudflare. | Set `--project-name=lords-gym` to match the dashboard. |
| Build fails | Often missing Supabase env at build time. | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in repo Secrets. |
| Admin “Invalid email or password” with hardcoded login | Password comparison was strict (no trim); or Supabase anon key UI showed and confused. | Trim password in auth; allow backup password `dev`; hide anon key section unless login fails with “not configured”. |

---

## 3b. What we should have checked sooner

1. **“Build passed” but production didn’t update**  
   → Open **Cloudflare → Workers & Pages → [project] → Deployments** and look at **Environment source**. If new deployments are **Preview**, the workflow’s `--branch` does not match the project’s production branch. Fix the workflow (e.g. `--branch=main`) before debugging secrets or project name.

2. **Project name vs branch**  
   Wrong **project** = deploys go to a different project. Wrong **branch** = deploys succeed but show as Preview and the production URL never changes. Both must match the Cloudflare project setup.

3. **Secrets and .env.local**  
   Use **Repository** secrets for Actions. For the set-secrets script, `.env.local` must be `KEY=value` with no spaces around `=`. If “Keys parsed from file” shows only some keys, fix the file format (and support `export` and BOM if needed).

4. **Hardcoded admin + Supabase UI**  
   If the app supports a hardcoded fallback login, don’t show “Add Supabase anon key” by default; only show it after a login error that indicates Supabase is required. Trim password and allow a backup password to avoid paste/space issues.

---

## 4. Quick verify after a push

1. [Actions](https://github.com/thill1/LordsGym/actions) → latest run for your commit.
2. **Build** = green.
3. **Deploy to Cloudflare Pages** job = green (and **not** “Waiting for approval”).
4. **Deploy diagnostics** = both secrets **set**.
5. **Deploy to Cloudflare Pages** step = green.
6. In Cloudflare: **Workers & Pages → lords-gym → Deployments** → new production deployment for that commit.

If all of the above are true and you still don’t see the deploy, check that you’re looking at the **lords-gym** project and **Production** (not a preview deployment).
