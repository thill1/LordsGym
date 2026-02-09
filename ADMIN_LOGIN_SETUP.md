# Admin Login Setup

The admin page at `/admin` uses Supabase Auth. Create the admin user with:

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

1. **GitHub secrets (most common)** – The production build must have Supabase env vars. In [GitHub → Settings → Secrets → Actions](https://github.com/thill1/LordsGym/settings/secrets/actions), ensure:
   - `VITE_SUPABASE_URL` = `https://mrptukahxloqpdqiaxkb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon (public) key from [Supabase API settings](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api).  
   After adding/updating secrets, **redeploy** (push a commit or run the workflow manually).

2. **Supabase URL Configuration** – [Authentication → URL Configuration](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/url-configuration):
   - **Site URL**: `https://lordsgymoutreach.com`
   - **Redirect URLs**: add `https://lordsgymoutreach.com/**`

3. **Use the correct URL** – `https://lordsgymoutreach.com/admin` or `https://lordsgymoutreach.com/#/admin` (both work)

4. **Reset password** – Run `npm run create-admin` (with `SUPABASE_SERVICE_ROLE_KEY`) to set a new password.
