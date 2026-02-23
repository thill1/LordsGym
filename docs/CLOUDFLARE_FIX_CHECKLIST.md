# Cloudflare Fix — Step-by-Step Checklist

**Use this while you have Cloudflare dashboard open.** Check off each step as you go.

---

## Step 1: Open the Failing Project

1. Go to **Workers & Pages** (you're likely already there).
2. Find the **lords-gym** entry that shows **"Latest build failed"** and **GitHub: thill1/LordsGym**.
3. **Click it** to open the project.

---

## Step 2: Fix the API Token

1. Click the **Settings** tab.
2. Scroll to **API token**.
3. Click the **edit (pencil)** icon.
4. **Create new token** or **Regenerate** the existing one.
5. Ensure it has **Cloudflare Workers** / **Workers Builds** permissions.
6. **Save** the new token and select it for this project.

---

## Step 3: Fix Deploy Command (Project Name)

1. In **Settings** → **Build configuration**, click the **edit (pencil)** icon.
2. Change **Deploy command** from:
   ```
   npx wrangler pages deploy dist --project-name=lords-gym-auburn
   ```
   to:
   ```
   npx wrangler pages deploy dist --project-name=lords-gym
   ```
   *(Use `lords-gym` to match the working project that has `lords-gym.pages.dev`.)*
3. Click **Save**.

---

## Step 4: Add Variables and Secrets

1. In **Variables and secrets**, click **+ Add**.
2. Add **CLOUDFLARE_ACCOUNT_ID** (wrangler may need this):
   - **Name:** `CLOUDFLARE_ACCOUNT_ID`
   - **Value:** `31b249266502ceaf30dbbbfcb5f601e0`
   - **Environment:** Production
3. Add **VITE_SUPABASE_URL:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://mrptukahxloqpdqiaxkb.supabase.co`
   - **Environment:** Production (check); Preview (optional)
   - **Encrypt:** No (or leave default)
3. Click **Add** / **Save**.
4. Add **second variable:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** *(paste from .env.local — the long `eyJ...` token)*
   - **Environment:** Production; Preview (optional)
   - **Encrypt:** Yes (recommended for secrets)
5. Click **Add** / **Save**.

---

## Step 5: Retry the Build

1. Go to the **Deployments** tab.
2. Find the latest **failed** deployment.
3. Click **Retry deployment** (or push a new commit to trigger a build).

---

## Optional: Disconnect Git (Use GitHub Actions Only)

If you prefer to rely on **GitHub Actions** for deploys instead of Cloudflare’s build:

1. In **Settings** → **Git repository**
2. Click **Disconnect**
3. The "No Git connection" lords-gym project will remain and continue receiving deploys from GitHub Actions.

---

## After You’re Done

- Unlock the browser if it’s still locked (click **Take Control** if you see that option).
- Tell me which steps you completed and whether the retry succeeded.
