# Admin Login Setup

## Supabase auth (required for full admin features)

The admin uses **Supabase Auth** when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. This is required for product CRUD, calendar, media library, and activity logs.

## Set admin password (recommended)

**Email:** lordsgymoutreach@gmail.com  
**Password:** Admin2026!

1. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. Run:
   ```bash
   npm run set-admin-password
   ```

3. Log in at [https://lordsgymoutreach.com/#/admin](https://lordsgymoutreach.com/admin)

## Create admin user (alternative)

Use `npm run create-admin` for a random one-time password. See below.

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
