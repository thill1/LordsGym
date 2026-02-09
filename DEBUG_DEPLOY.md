# Debug: Why isn’t my deploy showing on Cloudflare?

Use this when **pushes to `main` don’t show up as new production deployments** on Cloudflare (lords-gym / lordsgymoutreach.com).

---

## 1. How the pipeline works

| Step | What happens |
|------|-------------------------------|
| **Trigger** | Push to `main` or PR to `main` (or manual “Run workflow”). |
| **Build job** | Checkout → `npm ci` → `npm run build` (needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Uploads `dist` as artifact. |
| **Deploy job** | Runs only when **not** a PR (or PR from same repo). Uses GitHub **environment** `production`. Downloads `dist` → runs `wrangler pages deploy dist --project-name=lords-gym --branch=production`. |

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

- Workflow uses: `--project-name=lords-gym --branch=production`.
- **Project:** Must match the Cloudflare Pages project name (e.g. **lords-gym** in Workers & Pages). If it was wrong (e.g. `lords-gym-auburn`), deploys would go to a different project and you wouldn’t see them on lordsgymoutreach.com.
- **Branch:** For **Direct Upload** projects, production is often the branch named `production`. So `--branch=production` sends the deploy to **Production**. If your project’s production branch is `main`, change the workflow to `--branch=main`.

---

## 3. Lessons learned (for this repo)

| Issue | Cause | Fix |
|-------|--------|-----|
| No new deploy on Cloudflare for 15+ hours | 1) Workflow was deploying to **wrong project** (`lords-gym-auburn` instead of **lords-gym**). 2) Without `--branch=production`, `wrangler pages deploy` can create only **preview** deployments, so Production never updated. | Use `--project-name=lords-gym` and `--branch=production` in the deploy command. |
| Deploy job green but nothing on Cloudflare | Deploy job might be **waiting for environment approval** and the “Deploy to Cloudflare Pages” step never ran. | Approve the deployment in **Environments → production** or disable Required reviewers. |
| Deploy step fails with 403 / auth error | Missing or invalid `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID`; or token lacks permission. | Add as **Repository secrets** (Settings → Secrets and variables → Actions). Create token with **Account** → **Cloudflare Pages** → **Edit**. |
| "CLOUDFLARE_API_TOKEN is not set" (fail-fast) | Secret not added or only added to an environment. | Add both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as **Repository secrets** in Settings → Secrets and variables → Actions. |
| Deploy step fails: project not found | Project name in workflow doesn’t match Cloudflare (e.g. typo or different project). | Set `--project-name=lords-gym` to match the project in the dashboard. |
| Build fails | Often missing Supabase env at build time. | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in repo Secrets. |

---

## 4. Quick verify after a push

1. [Actions](https://github.com/thill1/LordsGym/actions) → latest run for your commit.
2. **Build** = green.
3. **Deploy to Cloudflare Pages** job = green (and **not** “Waiting for approval”).
4. **Deploy diagnostics** = both secrets **set**.
5. **Deploy to Cloudflare Pages** step = green.
6. In Cloudflare: **Workers & Pages → lords-gym → Deployments** → new production deployment for that commit.

If all of the above are true and you still don’t see the deploy, check that you’re looking at the **lords-gym** project and **Production** (not a preview deployment).
