# Acceptance Criteria and Regression Testing

This document describes the process for acceptance criteria on significant commits, pass-or-rollback behavior, and the weekly regression queue.

## Overview

- **Significant commits** (features, UI, DB, admin, API) must include acceptance criteria.
- All acceptance criteria must pass; otherwise, roll back.
- Tests that validate significant behavior persist in `tests/regression-queue.json` for weekly runs on **Sunday night**.

## Adding Acceptance Criteria to a Commit

Before committing, add acceptance criteria in the commit message body:

```
feat: Add Outreach admin image management

## Acceptance Criteria
- [ ] Admin → Outreach Page tab visible and editable
- [ ] Six image URL inputs save to Supabase
- [ ] Outreach page displays custom images when set
- [ ] Media Library Replace URL updates outreach images
```

Or create `docs/ACCEPTANCE_<feature>.md` and reference it in the commit.

## Pass or Roll Back

1. **Before push:** Run `npm run test` and `npm run test:e2e` (or `npm run test:e2e:local`).
2. **After push:** Run `npm run verify-push` and confirm the Cloudflare deploy succeeded.
3. **Verify in production:** Manually or via E2E against https://lords-gym.pages.dev.
4. **If criteria fail after deploy:**
   - Revert the commit or redeploy the previous SHA.
   - Fix locally, re-test, then redeploy.

## Regression Queue

**File:** `tests/regression-queue.json`

**Add a test** when merging a significant commit:

```json
{
  "id": "unique-slug",
  "name": "Human-readable name",
  "type": "unit|e2e|db|functional",
  "command": "npm run test:store",
  "source": "Feature X or commit Y",
  "optional": false
}
```

Use `"optional": true` for tests that may fail in CI (e.g. db-audit if Supabase is unreachable from GitHub runners).

**Run locally:**

```bash
npm run regression
```

**Weekly run:** `.github/workflows/regression-weekly.yml` runs Sunday night (Monday 07:00 UTC ≈ Sunday 11pm Pacific). It executes all tests in the queue against production. If any fail, investigate and fix.

## Adding New Regression Tests

1. Add the test to `tests/regression-queue.json`.
2. Ensure the `command` runs successfully locally: `npm run regression`.
3. Commit the queue change with the feature commit or in a follow-up.

## Rollback

To roll back a bad deploy:

1. Identify the last good commit SHA.
2. Revert: `git revert <bad-commit> --no-edit && git push origin main`
3. Or reset and force-push (use with caution): `git reset --hard <good-sha> && git push --force origin main`
4. Confirm the Cloudflare workflow deploys the reverted state.
5. Re-test acceptance criteria.
