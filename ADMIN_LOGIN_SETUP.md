# Admin Login Setup

## Supabase auth (required for full admin features)

The admin uses **Supabase Auth** when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured (e.g. in `.env.local`). This is required for features that use Supabase RLS (e.g. **recurring calendar patterns**, media library, activity logs).

Create or reset the admin user:

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
