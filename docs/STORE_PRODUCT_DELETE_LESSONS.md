# Store Product Delete — Lessons Learned & Prevention

**Incident:** Products deleted in Admin (Faith Over Fear Tee, Scripture Wristbands) reappeared in the catalog—on mobile, after refresh, and in the public Store. Basic e-commerce delete was not deterministic.

**Root causes identified:**

1. **Sync-from-constants re-adding deleted products** — When Supabase is configured but the fetch fails (network, mobile, CORS), `syncProductsFromConstants` ran and merged `ALL_PRODUCTS` into state, re-adding items the admin had deleted. The sync effect did not check `isSupabaseConfigured()` before running.

2. **Products still in database** — The Supabase `products` table retained deleted rows. Either the delete never succeeded (e.g. RLS, session), or something re-inserted them. DB verification showed w1 and a1 present.

3. **Multiple data sources** — Constants, localStorage, and Supabase created race conditions. When Supabase load failed, code fell back to constants, undoing deletions.

---

## Prevention — Architecture Rules

| Rule | Implementation |
|------|----------------|
| **Single source of truth when Supabase configured** | Supabase is the only source. Never merge from `ALL_PRODUCTS` when `isSupabaseConfigured()` is true. |
| **Never sync from constants when DB is source** | `syncProductsFromConstants` must NOT run when Supabase is configured. Add `if (isSupabaseConfigured()) return;` at the start of the sync effect. |
| **Delete must throw on error** | `deleteProduct` must `throw` on Supabase error so Admin can show `showError`. Never update local state before DB delete succeeds. |
| **Constants are seed only** | `ALL_PRODUCTS` is for initial seed or when no Supabase. It must never be used to re-add products when Supabase is the source of truth. |

---

## Deterministic Testing

To know with certainty that delete persists:

### 1. Integration test (DB verification)

`e2e/admin-product-delete-persistence.spec.ts`:

- **Setup:** Insert a product into Supabase via service role (bypasses RLS).
- **Action:** Log in as admin, delete the product via the UI.
- **Assert:** Query Supabase directly—product must not exist.

This proves the full chain: UI delete → Supabase delete → DB verification. If any step fails, the test fails.

### 2. E2E regression test

`admin-crud.spec.ts` → "deleted product stays deleted after page refresh":

- Create product → Delete → Reload page → Assert product not visible in Admin.
- Navigate to /shop → Assert product not visible.

### 3. Unit tests

`lib/store-products.test.ts` — Guards against sync re-adding deleted products. Caller responsibility: never invoke sync when Supabase is source.

### 4. CI requirement

- `test:e2e` must pass before deploy.
- `test:store` (unit) must pass.
- `admin-product-delete-persistence` runs when `SUPABASE_SERVICE_ROLE_KEY` and admin credentials are available.

---

## How to Run Deterministic Delete Test

```bash
# Requires .env.local with:
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY (for insert/verify)
#   E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD

node --env-file=.env.local scripts/run-e2e-with-env.mjs e2e/admin-product-delete-persistence.spec.ts
```

Or:

```bash
npx playwright test admin-product-delete-persistence
```

---

## Summary

- **Cause:** Sync ran when Supabase was source; constants re-added deleted products. DB may have retained rows if delete failed (RLS/session).
- **Fix:** Never run `syncProductsFromConstants` when `isSupabaseConfigured()`.
- **Verification:** Integration test creates in DB → deletes via UI → verifies in DB. This is deterministic and prevents recurrence.
