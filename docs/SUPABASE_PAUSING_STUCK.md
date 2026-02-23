# Supabase Project Stuck in PAUSING

## Current situation

- **Project:** Lords Gym (`mrptukahxloqpdqiaxkb`)
- **Region:** us-west-2
- **Status:** Stuck in `PAUSING` for an extended period

This happens when a pause operation was initiated (e.g. from the restart script or dashboard) but the underlying infrastructure never completes it.

## What we tried

- **Restore API while PAUSING:** Returns 400 Bad Request. Supabase only accepts restore when status is fully `PAUSED`.
- **No public API** exists to cancel or abort a pause operation.
- **Restore/cancel endpoint** only cancels a *restore* in progress, not a pause.

## What you can do

### 1. Wait longer
Some pauses can take 30+ minutes, especially if the DB was under load or had connectivity issues. Worth waiting another 15–30 minutes, then check status:

```powershell
node --env-file=.env.local scripts/supabase-diagnose.mjs
```

When it shows `PAUSED` (not `PAUSING`), run:

```powershell
node --env-file=.env.local scripts/supabase-diagnose.mjs --restore
```

### 2. Contact Supabase support (recommended if still stuck)

This is an infrastructure-side issue. Supabase can force the state.

- **Dashboard:** https://supabase.com/dashboard/support/new
- **Email:** support@supabase.com (from your registered account email)

**Include in your message:**
- Project ref: `mrptukahxloqpdqiaxkb` (Lords Gym)
- Region: us-west-2
- Issue: Project stuck in "Pausing" state for [X] minutes/hours; REST API and dashboard unresponsive
- Request: Manual infrastructure intervention to complete pause or restore the project

### 3. Check Supabase status

- Status page: https://status.supabase.com  
- If there’s an active incident, the pause may complete once it’s resolved.

## References

- GitHub issue: [Project stuck in "Pausing" state #42764](https://github.com/supabase/supabase/issues/42764) – similar case during Feb 2026 outage
- Supabase support policy: https://supabase.com/support-policy
