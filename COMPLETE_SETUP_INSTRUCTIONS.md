# Complete Supabase Setup - Final Instructions

## The Issue

Browser automation tools (Chrome DevTools, browser extensions) launch **separate browser instances** and cannot access your authenticated Chrome session. This is a security feature.

## The Solution: Use Service Role Key

The only programmatic way to create storage buckets and admin users is via the **Supabase Management API** using a **service role key**.

## Step 1: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api
2. Scroll down to **"service_role"** key (NOT the anon key)
3. Copy the service role key (starts with `eyJ...`)

## Step 2: Add to .env.local

Add this line to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ IMPORTANT**: Never commit the service role key to git! It has admin access.

## Step 3: Run the Setup Script

```bash
node scripts/complete-supabase-with-service-key.js
```

This will:
- ✅ Create the `media` storage bucket
- ✅ Create an admin user with `{"role": "admin"}` metadata
- ✅ Verify everything is set up correctly

## Alternative: Manual Completion (5 minutes)

If you prefer not to use the service role key:

1. **Create Storage Bucket**:
   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets
   - Click "New bucket"
   - Name: `media`
   - Check "Public bucket"
   - Click "Create bucket"

2. **Create Admin User**:
   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users
   - Click "Add user" → "Create new user"
   - Enter email and password
   - Check "Auto Confirm User"
   - Click "Advanced" → Add metadata: `{"role": "admin"}`
   - Click "Create user"

## Why Browser Automation Doesn't Work

- Chrome DevTools connects to a separate Chrome instance (launched with `--remote-debugging-port`)
- Browser extensions also launch separate instances
- Your authenticated session is in your regular Chrome browser
- Browser security prevents automation tools from accessing your session cookies

This is by design for security reasons.

## Verification

After completing setup, run:

```bash
node scripts/complete-supabase-setup.js
```

This will verify:
- ✅ All 15 tables exist
- ✅ Storage bucket exists
- ✅ Default data exists
- ⚠️ Admin user (requires manual verification)
