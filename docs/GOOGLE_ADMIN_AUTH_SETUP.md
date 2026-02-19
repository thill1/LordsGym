# Google Admin Auth Setup

This project uses Google OAuth as the primary admin sign-in flow with a break-glass password account for emergencies.

## 1) Configure Supabase Google Provider

1. Open Supabase dashboard for project `mrptukahxloqpdqiaxkb`.
2. Go to **Authentication → Providers → Google**.
3. Enable Google provider and add Google OAuth Client ID + Secret.
4. Add redirect URLs:
   - `http://localhost:5173/admin`
   - `https://lordsgymoutreach.com/admin`

You can also automate this with:

```bash
npm run check:google-auth
npm run setup:google-auth
```

`setup:google-auth` requires `SUPABASE_ACCESS_TOKEN`, `GOOGLE_OAUTH_CLIENT_ID`, and `GOOGLE_OAUTH_CLIENT_SECRET`.

## 2) Configure App Environment

Set these values in `.env.local` (local) and GitHub Actions secrets (production build):

- `VITE_ADMIN_ALLOWLIST_EMAILS` (comma-separated Gmail allowlist)
- `VITE_BREAK_GLASS_ADMIN_EMAIL` (single emergency account email)
- `VITE_ADMIN_OAUTH_REDIRECT_URL` (optional override; defaults to `<origin>/admin`)

Example:

```env
VITE_ADMIN_ALLOWLIST_EMAILS=owner@gmail.com,ops@gmail.com
VITE_BREAK_GLASS_ADMIN_EMAIL=admin@lordsgym.com
VITE_ADMIN_OAUTH_REDIRECT_URL=https://lordsgymoutreach.com/admin
```

## 3) Break-Glass Account

- Keep one admin account as the break-glass password account.
- Password sign-in is restricted to this email only.
- Rotate/store credentials in a secure password manager.

## 4) Verify

1. Google sign-in succeeds for allowlisted Gmail accounts.
2. Google sign-in denies non-allowlisted Gmail accounts.
3. Password sign-in only succeeds for the break-glass account.
4. Admin activity logs capture login method (`google` or `password`).
