# Admin Login Setup

## Hardcoded fallback (current)

You can log in **right now** at **[https://lordsgymoutreach.com/#/admin](https://lordsgymoutreach.com/#/admin)** with:

- **Email:** `lordsgymoutreach@gmail.com`
- **Password:** `admin2026`

This is in code in `lib/auth.ts` (`FALLBACK_ADMIN_EMAIL` / `FALLBACK_ADMIN_PASSWORD`). Change or remove it when you switch to Supabase.

**If that URL shows an old or different site:** lordsgymoutreach.com must serve the LordsGym React app (e.g. from Cloudflare Pages). If you use Cloudflare, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to [GitHub Secrets](https://github.com/thill1/LordsGym/settings/secrets/actions) so the "Deploy to Cloudflare Pages" workflow succeeds and the domain gets the latest build.

---

## Supabase auth (optional later)

The admin page can use Supabase Auth. Create the admin user with:

## Create admin user

**Email:** lordsgymoutreach@gmail.com  
**Password:** Auto-generated (unique, printed once)

On first login, the user must change their password before accessing the dashboard.

### Run the script

1. Get your **service_role** key from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api).

2. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Run:
   ```bash
   npm run create-admin
   ```

   Or inline:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/create-admin-user.js
   ```

4. **Save the printed password** – it is shown only once.

5. Log in at [https://lordsgymoutreach.com/admin](https://lordsgymoutreach.com/admin)

## If user already exists

Use Supabase Dashboard → **Authentication** → **Users** → find the user → **Send password reset** or **Edit** to set a new password.

## Login still says "Invalid email or password"

1. **Quick fix (no redeploy)** – On the admin login page, use **"Add Supabase anon key"**: paste your [Supabase anon key](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api) (anon public), click **Save & retry**, then sign in again. The key is stored in your browser only.

2. **Or add to GitHub** – Add `VITE_SUPABASE_ANON_KEY` to [GitHub Secrets](https://github.com/thill1/LordsGym/settings/secrets/actions) and redeploy so the key is in the build.

3. **Wrong password** – Run `npm run create-admin` (with `SUPABASE_SERVICE_ROLE_KEY` in .env.local) to reset the password.

4. **Supabase URL Configuration** – [Authentication → URL Configuration](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/url-configuration):
   - **Site URL**: `https://thill1.github.io` (or your deployment URL)
   - **Redirect URLs**: add `https://thill1.github.io/**`, `https://lordsgymoutreach.com/**`

5. **Use the correct admin URL**:
   - GitHub Pages: `https://thill1.github.io/LordsGym/#/admin`
   - Cloudflare/custom: `https://yoursite.com/admin` or `/#/admin`
