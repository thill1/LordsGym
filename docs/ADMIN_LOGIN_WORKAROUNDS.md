# Admin Login Workarounds

When Supabase is unreachable (522, Failed to fetch, timeout), use these steps in order.

## Credentials
- Email: lordsgymoutreach@gmail.com (not lordsjimaoutreach)
- Password: Admin2026!

## Step 1: Paste Config Before Login
1. Open admin login page
2. Under Troubleshooting: Override Supabase config, paste URL and anon key from .env.local or Supabase Dashboard > Settings > API
3. Click Save & retry
4. Sign in with email and password

## Step 2: Automatic Fallbacks
App tries: (1) direct Supabase, (2) proxy via Cloudflare /api/auth-login, (3) production fallback for known admin when both fail.

## Step 3: Different Network
Try mobile hotspot, different Wi-Fi, or VPN.

## Step 4: Verify Deploy
Ensure functions/ is deployed. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in GitHub Secrets.

## Step 5: Contact Supabase
Project mrptukahxloqpdqiaxkb; ask them to check pooler and us-west-2 routing.
