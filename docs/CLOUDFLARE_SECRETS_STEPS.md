# Exact steps: Cloudflare API token & Account ID

Use these to get **CLOUDFLARE_API_TOKEN** and **CLOUDFLARE_ACCOUNT_ID** for the deploy workflow (or for `.env.local` and `npm run set:cloudflare-secrets`).

---

## Part A: Get Cloudflare Account ID

1. Open: **https://dash.cloudflare.com/**
2. Log in if needed.
3. Click any site or go to **Workers & Pages** in the left sidebar.
4. On the right side of the page, find **Account ID** (under the account name).
5. Click **Copy** next to Account ID (or select and copy).
6. Save it somewhere safe — this is your **CLOUDFLARE_ACCOUNT_ID** (e.g. 32 hex characters).

---

## Part B: Create Cloudflare API token

1. Open: **https://dash.cloudflare.com/profile/api-tokens**
   - Or: **dash.cloudflare.com** → top-right **profile icon** → **My Profile** → left sidebar **API Tokens**.
2. Click **Create Token**.
3. Either:
   - Use the template **“Edit Cloudflare Workers”** and click **Use template**,  
   - Or click **Create Custom Token**.
4. Set:
   - **Token name:** e.g. `LordsGym GitHub Deploy`
   - **Permissions:**  
     - **Account** → **Cloudflare Pages** → **Edit**
   - (If using a custom token, leave other permissions as default or minimal.)
5. Under **Account Resources**, choose **Include** → **Your account** (or the account that has the lords-gym project).
6. Click **Continue to summary**, then **Create Token**.
7. **Copy the token immediately** — it’s shown only once. This is your **CLOUDFLARE_API_TOKEN**.

---

## Part C: Where to put the secrets

You can do **one** of the following.

### Option 1: Set GitHub repo secrets via script (recommended)

1. In your project root, open or create **`.env.local`** (same folder as `package.json`).
2. Add these lines (paste your real values, no quotes):

   ```
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   CLOUDFLARE_API_TOKEN=your_token_from_Part_B
   CLOUDFLARE_ACCOUNT_ID=your_account_id_from_Part_A
   ```

3. Save the file.
4. In the project root run:

   ```bash
   npm install
   npm run set:cloudflare-secrets
   ```

   That pushes **CLOUDFLARE_API_TOKEN** and **CLOUDFLARE_ACCOUNT_ID** into the repo’s **Actions** secrets via the GitHub API.

5. In GitHub: **Actions** → open the latest **“Deploy to Cloudflare Pages”** run → **Re-run all jobs**.

### Option 2: Set GitHub repo secrets in the UI

1. Open: **https://github.com/thill1/LordsGym/settings/secrets/actions**
2. Click **New repository secret**.
3. **Name:** `CLOUDFLARE_API_TOKEN`  
   **Value:** the token from Part B → **Add secret**.
4. Click **New repository secret** again.
5. **Name:** `CLOUDFLARE_ACCOUNT_ID`  
   **Value:** the Account ID from Part A → **Add secret**.
6. In **Actions**, re-run the failed **“Deploy to Cloudflare Pages”** workflow.

---

## Checklist

- [ ] **CLOUDFLARE_ACCOUNT_ID** copied from Cloudflare dashboard (right sidebar).
- [ ] **CLOUDFLARE_API_TOKEN** created with **Account → Cloudflare Pages → Edit** and copied.
- [ ] Either: **Option 1** — values in `.env.local` and `npm run set:cloudflare-secrets` run,  
  or **Option 2** — both added under **Settings → Secrets and variables → Actions**.
- [ ] Workflow **“Deploy to Cloudflare Pages”** re-run (or a new push to `main`).
