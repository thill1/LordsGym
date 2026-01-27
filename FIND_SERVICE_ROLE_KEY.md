# Finding Your Supabase Service Role Key

## Step-by-Step Instructions

1. **Go to your project's API settings:**
   ```
   https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api
   ```

2. **Look for these sections:**
   - **Project API keys** section
   - You should see:
     - `anon` `public` key (this is what you already have)
     - `service_role` `secret` key (this is what we need)

3. **If you don't see "service_role":**
   - It might be collapsed/hidden - look for a "Show" or "Reveal" button
   - It might be under "Project API keys" → "service_role"
   - Some projects require you to click "Reveal" to show secret keys

4. **What it looks like:**
   - Starts with `eyJ...` (a JWT token)
   - Labeled as `service_role` and `secret`
   - Much longer than the anon key

## Alternative: Check Project Settings

If you still can't find it:

1. Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/general
2. Check if there are any API key settings there
3. Or try: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/auth

## If Service Role Key is Not Available

If Supabase doesn't show the service role key (some projects restrict it), you have two options:

### Option 1: Manual Completion (Recommended - 2 minutes)
Complete the remaining tasks manually in the dashboard:

1. **Create Storage Bucket:**
   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets
   - Click "New bucket"
   - Name: `media`
   - Check "Public bucket"
   - Click "Create bucket"

2. **Create Admin User:**
   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users
   - Click "Add user" → "Create new user"
   - Email: `admin@lordsgym.local`
   - Password: (choose a secure password)
   - Check "Auto Confirm User"
   - Click "Advanced" → Add metadata: `{"role": "admin"}`
   - Click "Create user"

### Option 2: Use Supabase CLI
If you install the Supabase CLI, you might be able to use it with your dashboard login.
