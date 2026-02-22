# Admin Login Troubleshooting

## Correct credentials

| Field | Correct value | Common mistakes |
|-------|---------------|-----------------|
| **Email** | `lordsgymoutreach@gmail.com` | `lordsjimaoutreach` (typo – "jima" vs "gym") |
| **Password** | `Admin2026!` | `admin 2026!` (lowercase, space); `admin2026!` (no capital A) |

## Login flow

1. **Supabase configured** (anon key in build or pasted in browser):  
   Auth uses Supabase. The password must match what’s in Supabase for `lordsgymoutreach@gmail.com`.

2. **Supabase not configured**:  
   Only works in **local dev** (`npm run dev`). Accepted passwords: `dev`, `admin123`, `Admin2026!`.  
   In **production**, this path is disabled. You must configure Supabase.

## Fixes (in order)

### 1. Ensure password is set in Supabase

```bash
npm run set-admin-password
```

Needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. This sets the password to `Admin2026!` for `lordsgymoutreach@gmail.com`.

### 2. Ensure production build has Supabase keys

GitHub Actions use:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Add these under GitHub → Settings → Secrets and variables → Actions. Redeploy after adding.

### 3. If keys are missing: paste anon key in browser

On the login page, when Supabase is not configured, you’ll see **“Admin login not configured”**. Use the form to:

1. Paste your Supabase anon key (from [Supabase → Settings → API](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api))
2. Click “Save anon key & retry”
3. Sign in with `lordsgymoutreach@gmail.com` and `Admin2026!`

### 4. Verify login from CLI

```bash
node --env-file=.env.local scripts/diagnose-admin-login.js "Admin2026!"
```

If this works but the site doesn’t, the production build likely lacks the anon key.

## Code/config changes that can cause issues

| Change | Effect |
|--------|--------|
| Removing `VITE_SUPABASE_ANON_KEY` from GitHub Secrets | Production build cannot talk to Supabase → login fails |
| Running `create-admin` instead of `set-admin-password` | Random password instead of `Admin2026!` |
| Typo in email (`lordsjimaoutreach`) | No matching user in Supabase |
| Wrong password format | Supabase rejects |
