# Lord's Gym Store & Merchandise — Test Strategy

**Purpose:** Ensure store, cart, checkout, and admin CRUD work correctly before increased usage.  
**Executable:** This evening and as part of CI/deployment.

---

## 1. Architecture Summary

| Layer | What it does |
|-------|--------------|
| **Products** | Supabase `products` table; CRUD in Admin; display on Shop/Home |
| **Cart** | Client-side (localStorage + React state); add/remove/update quantity |
| **Checkout** | Mock payment (2s delay); clears cart; redirects to Order Confirmation |
| **Orders** | None persisted; checkout is simulated only |

**Critical paths:**
- Admin add/edit/delete product → Supabase → Store/Shop reflect changes
- Add to cart → Cart drawer → Checkout → Order confirmation
- Cart quantity → 0 removes item
- Accessories show "One Size" (not "L")

---

## 2. Test Layers

### Layer 1: Unit Tests (Vitest) — Fast, no network

Tests pure logic: product sync, cart operations.

| File | What it tests |
|------|---------------|
| `lib/store-products.test.ts` | `syncProductsFromConstants` — no re-add of deleted products, preserves customizations |
| `lib/cart-operations.test.ts` | `addToCart`, `removeFromCart`, `updateQuantity` (including qty→0), `cartTotal`, `cartCount` |

**Run:**
```bash
npm run test
```

### Layer 2: Supabase CRUD Script — Integration

Tests actual Supabase connectivity and products CRUD (create, read, update, delete).

**Prerequisites:** `.env.local` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and preferably `SUPABASE_SERVICE_ROLE_KEY`.

**Run:**
```bash
node --env-file=.env.local scripts/test-crud-operations.js
```

### Layer 3: E2E Tests (Playwright) — Full user flows

| File | What it tests |
|------|---------------|
| `e2e/store.spec.ts` | Shop grid, add to cart, cart qty→0, accessories "One Size", full checkout flow |
| `e2e/admin-crud.spec.ts` | Admin product add/edit/delete, bulk delete, admin→store sync, deleted stays deleted, image coming soon |

**Prerequisites:**
- App running (e.g. `npm run dev` or `npm run preview`)
- For admin tests: `ADMIN_EMAIL` and `ADMIN_PASSWORD` (or `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`) in env

**Run:**
```bash
npm run test:e2e
```

With env loaded:
```bash
npm run test:e2e:local
```

Store-only:
```bash
npx playwright test e2e/store.spec.ts
```

---

## 3. Execution Order (This Evening)

Follow this order for a full validation run:

### Step 1: Unit tests (must pass)

```bash
cd c:\Users\troyh\LordsGym
npm run test
```

**Expected:** All Vitest tests pass (store-products + cart-operations).

### Step 2: Supabase CRUD (optional but recommended)

```bash
node --env-file=.env.local scripts/test-crud-operations.js
```

**Expected:** Products CREATE, READ, UPDATE, DELETE all pass.

### Step 3: Build and preview (for local E2E)

```bash
npm run build
npm run preview
```

Leave preview running (usually http://localhost:4173).

**Note:** By default, Playwright uses `https://lords-gym.pages.dev`. To run E2E against local preview instead:
```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:4173"
npx playwright test e2e/store.spec.ts
```

### Step 4: E2E — store only (no admin credentials needed)

```bash
npx playwright test e2e/store.spec.ts
```

Or with env:
```bash
npm run test:e2e:local -- e2e/store.spec.ts
```

**Expected:** Shop, cart, checkout flow, accessories "One Size" all pass.

### Step 5: E2E — admin CRUD (requires admin credentials)

Ensure `.env.local` has:
```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-password
```
(or `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`)

```bash
npx playwright test e2e/admin-crud.spec.ts
```

**Expected:** Store CRUD, bulk delete, admin→store sync, deleted stays deleted, image coming soon all pass.

### Step 6: Full E2E suite

```bash
npm run test:e2e
```

---

## 4. Coverage Matrix

| Flow | Unit | Script | E2E |
|------|------|--------|-----|
| Product sync (no re-add deleted) | ✅ | — | ✅ admin |
| Product CRUD ( Supabase ) | — | ✅ | ✅ admin |
| Add to cart | ✅ | — | ✅ store |
| Remove from cart | ✅ | — | — |
| Update quantity (incl. qty→0) | ✅ | — | ✅ store |
| Accessories "One Size" | — | — | ✅ store |
| Checkout → Order confirmation | — | — | ✅ store |
| Empty cart on checkout | — | — | ✅ store |
| Admin bulk delete | — | — | ✅ admin |
| Deleted product stays deleted | — | — | ✅ admin |
| Image coming soon | — | — | ✅ admin |

---

## 5. Known Defects (Resolved)

From `docs/STORE_POSTMORTEM_INCIDENT_REPORT.md`:

- Admin–store sync (deleted products shown) — fixed
- Cart quantity 0 kept item — fixed
- Accessories showed "Size: L" — fixed
- Return to Shop navigation — fixed

Tests above guard against regression.

---

## 6. Quick Commands Reference

```bash
npm run test               # Unit tests
npm run test:watch         # Unit tests (watch mode)
npm run test:e2e           # All E2E
npm run test:e2e:local     # E2E with .env.local
npm run test:e2e:ui        # E2E with UI
```

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| E2E: "Target page closed" | Ensure preview is running (`npm run preview`) |
| E2E admin: tests skip | Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in env |
| Supabase CRUD fails | Check `.env.local` has Supabase URL and keys |
| Unit tests fail | Run `npm run test` and read output; cart/store-products logic may have regressed |
