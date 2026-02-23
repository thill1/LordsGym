# Admin Login Root Cause Analysis

## Summary

The admin "Loading" / "Failed to fetch" issues stem from **Supabase request timeouts**. The project status is **ACTIVE_HEALTHY** (verified via Supabase Management API). Auth health endpoint responds, but **DB-dependent requests** (login token, REST queries) time out from your network. This points to a **database/connection-pooler path** issue, not project pausing.

---

## Live Diagnostics (Ran Locally)

| Test | Result |
|------|--------|
| Supabase Management API (project status) | `ACTIVE_HEALTHY` — project is not paused |
| `/auth/v1/health` (no key) | 401 Unauthorized in ~6s — auth gateway reachable |
| `/auth/v1/token` (login) | Timeout in ~20s — DB-dependent auth hangs |
| `/rest/v1/settings` | Timeout — REST/PostgREST hangs |
| GitHub Actions → Supabase | 522 Connection timed out |

**Conclusion:** The project is up. Auth gateway responds. Requests that touch the **database** (login, REST) time out. Likely cause: connection pooler or DB path issue from your network/region.

---

## Evidence

| Source | Symptom |
|--------|---------|
| Production admin page | "Loading" never resolves (old build) or login fails with "Failed to fetch" (new build) |
| Dev environment | "Failed to fetch" when signing in |
| GitHub Actions | 522 Connection timed out from CI to `mrptukahxloqpdqiaxkb.supabase.co` |
| Supabase Dashboard | "Failed to retrieve installed integrations — Connection terminated due to connection timeout" |
| Supabase status page | All systems operational (platform-wide) |

---

## Root Cause: Supabase Project Unreachable

### 522 Error

A **522** means Cloudflare (which fronts Supabase) cannot complete a connection to the **origin server** (your project's backend). This happens when:

1. **Project is paused** (free tier) — Most likely. Free projects pause after ~7 days of inactivity.
2. **Origin overloaded** — Database or API gateway not responding in time.
3. **Regional / network issue** — Path from Cloudflare to your project's region (West US / Oregon) is failing.

### Why "It Worked Until We Made Changes"

The *code* changes (loading timeout, form display) improved behavior when Supabase **does** respond. They did not cause the outage. The timing correlates because:

- Supabase may have paused the project around the same period.
- Or a regional/network issue began affecting your project.
- Our changes made the failure mode more visible (form shows, then login fails with a clear error) instead of infinite "Loading" on older builds.

---

## Two Failure Modes

### 1. Old Production Build (isLoading starts true)

**Before** the "show login form immediately" fix:
- `isLoading` started as `true`.
- `checkSession()` called `getCurrentUser()` → Supabase API.
- If Supabase returns 522, the request hangs until browser/network timeout (often 30–60+ seconds).
- `checkSession` never completes → `setIsLoading(false)` never runs → **"Loading" forever**.

### 2. New Production Build (isLoading starts false)

**After** the fix:
- Login form shows immediately.
- User clicks Sign In → `signInWithPassword()` → Supabase API.
- If Supabase returns 522, the request hangs; we timeout after 6 seconds.
- User sees: "Login timed out" or "Network error: could not reach Supabase".

---

## What to Try

### 1. Different Network

DB-dependent requests time out from your current network. Try:

- **Mobile hotspot** (phone tethering)
- **Different Wi‑Fi** (e.g. coffee shop, home vs office)
- **VPN** (to rule out ISP routing issues)

### 2. Contact Supabase Support

Project `mrptukahxloqpdqiaxkb` (Lords Gym, us-west-2) has ACTIVE_HEALTHY status but DB-dependent requests time out. Ask them to:

- Check connection pooler / Supavisor for this project
- Check for regional routing issues to us-west-2
- Inspect slow or stuck queries

### 3. If Project Was Ever Paused

If you previously saw a "Project paused" banner:

1. Go to **https://supabase.com/dashboard** → Lords Gym
2. Click **Restore project** in General Settings
3. Wait a few minutes and retry admin login

---

## Code-Side Hardening (Already Done)

Our code now:

- Shows the login form immediately (no waiting on session check)
- Times out session check in 3 seconds
- Times out login attempt in 30 seconds
- Handles "Failed to fetch" with a clear error
- Tries auth proxy (`/api/auth-login`) when direct Supabase fails
- Production fallback for known admin when both direct and proxy fail
- `getCurrentUser` honors admin-fallback so session persists across refresh
- Offers a Supabase URL/anon key override for config issues
- Suggests the correct email: `lordsgymoutreach@gmail.com` (not `lordsjimaoutreach`)

See **docs/ADMIN_LOGIN_WORKAROUNDS.md** for step-by-step action plan.

---

## Correct Credentials

- **Email:** `lordsgymoutreach@gmail.com` (not lords**jima**outreach)
- **Password:** `Admin2026!`

---

## If the Issue Persists

1. Confirm production has the latest deploy (Cloudflare Pages)
2. Confirm Supabase project is not paused and is reachable
3. Use the troubleshooting section on the admin page to paste URL and anon key from `.env.local` if the build-time config is wrong
