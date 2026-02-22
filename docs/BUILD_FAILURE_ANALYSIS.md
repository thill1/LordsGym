# GitHub Actions Build Failure Analysis

**Date:** 2026-02-22  
**Scope:** Deploy to Cloudflare Pages workflow

## Summary

**Production is serving a build from Feb 21 ~02:00 UTC.** No Cloudflare deploy has succeeded since then. All admin login fixes (loading, email typo, Supabase override, etc.) are **not in production**.

---

## Failure Categories

### 1. Type-check failures (fast ~29–36s)

| Error | Cause |
|-------|-------|
| `Property 'comingSoonImage' does not exist on type 'Product'` | `types.ts` not updated before Admin/StoreContext used it |
| `Cannot find module '../lib/cart-operations'` | `lib/cart-operations.ts` was missing |

**Fixed by:** `5bb725e fix: add cart-operations and comingSoonImage to unblock deploy`

### 2. Database audit failures (slow ~12min)

- GitHub Actions runners (Azure East US 2) receive **522 Connection timed out** when reaching Supabase (`mrptukahxloqpdqiaxkb.supabase.co`).
- DB audit makes many sequential Supabase calls; each times out after ~40s.
- Script exits with code 1 → build failed (before `continue-on-error`).
- **Fixed partially by:** `1eb9a20 fix(deploy): unblock build` — added `continue-on-error: true` so the job continues when audit fails.
- **Still a problem:** Audit runs ~12 minutes before failing, delaying every build.

### 3. Workflow improvements (local, uncommitted)

- `timeout 45` around db audit → fails in 45s instead of 12min.
- `timeout-minutes: 1` on the step → GitHub kills it after 1 minute max.

---

## Deploy History

| Run   | Commit                               | Result   | Duration |
|-------|--------------------------------------|----------|----------|
| 22248135879 | Store delete fix, Google Reviews... | success  | 1m22s   |
| 22264991964 | Fix product delete regression       | success  | 2m4s    |
| 22264994776 | Docs: add regression test            | success  | 3m57s   |
| 22265799762 | Fix mobile/incognito                 | failure  | 34s     |
| …     | …                                    | failure  | …       |
| 22270905495 | fix(admin): aggressive loading timeout | failure | 12m21s |
| 22271672326 | fix(deploy): unblock build           | in_progress | 9m+  |
| 22271710307 | fix(admin): show login form immediately | pending | 6m+  |

**Last successful Cloudflare deploy:** Run 22248135879 (Feb 21 ~02:00 UTC)

---

## What Production Has vs Does Not Have

**Has (from last successful deploy):**
- Store delete fix, Google Reviews, CRUD hardening

**Does not have:**
- Admin login fixes (loading, email validation, Supabase override)
- `comingSoonImage` on Product
- `lib/cart-operations.ts` (build would have failed without it, but previous deploy was before that dependency)
- DB audit timeout improvements

---

## Recommended Actions

1. **Commit workflow timeout fix** — `timeout 45` + `timeout-minutes: 1` on db audit step so builds don’t sit in audit for 12 minutes.
2. **Push and wait for deploy** — Cloudflare workflow should complete in ~4–5 min once the audit step fails quickly.
3. **Optional:** Disable db audit in CI (e.g. `if: false` or skip when `CI=true`) since Supabase is unreachable from GitHub runners. Run audit locally or in a separate job instead.
