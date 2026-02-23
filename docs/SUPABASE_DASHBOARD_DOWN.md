# When the Supabase Dashboard Is Down or Timing Out

The Supabase dashboard can occasionally time out (e.g. "Failed to retrieve installed integrations", "Connection terminated due to connection timeout"). **Your project and Auth API keep working** – the dashboard is just the control panel.

## You Don't Need the Dashboard

Your Supabase credentials are in `.env.local`. Use them directly.

### Get Values for GitHub Secrets

```bash
npm run show:supabase-secrets
```

This prints `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to copy into [GitHub → Settings → Secrets → Actions](https://github.com/thill1/LordsGym/settings/secrets/actions).

### Sync to Production Automatically

If you have a GitHub PAT with `repo` and `actions` scope:

```bash
GITHUB_TOKEN=ghp_xxx node --env-file=.env.local scripts/set-github-supabase-secrets.js
```

This writes the values from `.env.local` into GitHub Secrets so the next deploy uses them.

### If Production Login Still Fails

1. Add the secrets via `show:supabase-secrets` output (manual) or the script above.
2. Or use the **Troubleshooting: Override Supabase config** section on the admin login page – paste the URL and anon key from `.env.local` (lines 4–5). Stored in your browser; overrides the build.

## Supabase Status

- Status: https://status.supabase.com
- Recent incidents can cause dashboard slowness; Auth and API are usually unaffected.
