# Supabase PAUSING State — Expert Recovery Guide

When a Supabase project is stuck in **PAUSING** (transitioning from ACTIVE → PAUSED), the database compute is being torn down. There is no public API to "cancel" a pause. This guide collects every option you have.

---

## Understanding the State Machine

```
ACTIVE  →  PAUSING  →  PAUSED  →  RESTORING  →  ACTIVE
              ↑                      │
              └── (stuck here)       └── POST /restore
```

- **PAUSING**: Infrastructure is draining connections, checkpointing Postgres, snapshotting, shutting down compute.
- **Stuck**: If any step hangs (e.g. connection drain, storage), the transition never completes.
- **POST /restore**: Only accepted when status is **PAUSED**. Returns 400 while PAUSING.

---

## Option 1: Try API-Based Recovery

Run the diagnostics script with `--try-recovery`:

```powershell
node --env-file=.env.local scripts/supabase-diagnose.mjs --try-recovery
```

This attempts, in order:

1. **PUT `/config/database/postgres`** with `{ "restart_database": true }`  
   - The Management API allows a database restart as part of Postgres config updates. If the DB layer is still reachable during PAUSING, this *might* interrupt the pause and bring the project back.
2. **POST `/restore/cancel`**  
   - Cancels an in-progress *restore*. May have no effect on a pause, but worth trying.
3. **POST `/restore`**  
   - In case the state has progressed to PAUSED between steps, triggers restore.

**Success rate**: Low when truly stuck. The DB is usually unreachable during PAUSING. Still worth one attempt.

---

## Option 2: Wait

Some pauses take 30+ minutes under load or degraded infrastructure. Check status periodically:

```powershell
node --env-file=.env.local scripts/supabase-diagnose.mjs
```

When status shows **PAUSED** (not PAUSING), run:

```powershell
node --env-file=.env.local scripts/supabase-diagnose.mjs --restore
```

---

## Option 3: Escalate to Supabase

If stuck for hours:

- **Dashboard**: [supabase.com/dashboard/support/new](https://supabase.com/dashboard/support/new)
- **Email**: support@supabase.com (from your registered account)
- **Include**: Project ref `mrptukahxloqpdqiaxkb`, region `us-west-2`, status `PAUSING`, duration
- **Discord**: [discord.supabase.com](https://discord.supabase.com) — sometimes staff respond faster in #help

---

## Option 4: Create a New Project (Guaranteed Path)

Your schema and core content live in the repo. Creating a new project is the only guaranteed way to be back online without Supabase support.

1. [Create a new project](https://supabase.com/dashboard) in the same org.
2. Apply migrations (CLI `db push` or run SQL from `supabase/migrations/` in order).
3. Update `.env.local` with the new project URL and anon key.
4. Create admin user in Auth → Users.
5. Re-enter calendar data and any custom pages via the admin.

See the prior analysis for what’s in code (products, settings, testimonials) vs what’s lost (calendar, custom pages, auth users).

---

## Summary

| Action              | When                      | Effort |
|---------------------|---------------------------|--------|
| `--try-recovery`    | Stuck in PAUSING          | 1 min  |
| Wait + `--restore`  | Status becomes PAUSED      | Passive|
| Support ticket      | Stuck for hours           | 1 form |
| New project         | Need site live now        | ~30 min|
