# E2E Testing

Production smoke tests run against the deployed site (https://lords-gym.pages.dev).

## Running locally

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
```

Set `PLAYWRIGHT_BASE_URL` to test a different environment:
```bash
PLAYWRIGHT_BASE_URL=https://lordsgymoutreach.com npm run test:e2e
```

## Admin tests (optional)

Admin Calendar test requires credentials. Set in CI secrets or locally:
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

Without these, the admin test is skipped.

## CI/CD

E2E tests run automatically after deploy in `.github/workflows/cloudflare-pages.yml`:
- Trigger: push to `main` (after build + deploy)
- Target: https://lords-gym.pages.dev
- Tests: smoke (home, shop, calendar, membership, contact, admin login, cart), store (product grid, add to cart)

## Test coverage

| Area | Tests |
|------|-------|
| Home | Hero, testimonials, New Arrivals |
| Shop | Product grid, Add to Cart, cart drawer |
| Calendar | View options, Community/Outreach labels |
| Membership | Join, tiers |
| Contact | Form visible |
| Admin | Login page, Calendar Management (with creds) |
| **Admin CRUD** | Store (add/edit/delete, bulk delete), Testimonials (add/edit/delete), Calendar (add/delete) |

Admin CRUD tests require `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD`. They create test data with "E2E Test" prefix and delete it after each run.

**See [E2E_ADMIN_TESTS_SETUP.md](E2E_ADMIN_TESTS_SETUP.md)** for how to enable the 5 skipped admin tests in CI.
