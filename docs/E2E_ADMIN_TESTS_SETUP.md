# E2E Admin Tests — Enabling the 5 Skipped Tests

## Summary

Five E2E tests are skipped on every run because they require admin credentials. Once configured, they run automatically in CI after each deploy to production.

---

## The 5 Skipped Tests

| Test | What it does |
|------|--------------|
| Admin Calendar - Calendar Management loads | Logs in, opens Calendar tab, verifies Add Event or table loads |
| Store CRUD - add, edit, delete product | Creates test product, edits it, deletes it |
| Store CRUD - **deleted product stays deleted after refresh** | Regression: delete product, refresh page, verify it stays gone |
| Store CRUD - bulk delete | Creates 2 test products, bulk selects, bulk deletes |
| Testimonials CRUD - add, edit, delete | Creates testimonial, edits quote, deletes |
| Calendar CRUD - add and delete event | Creates one-time event, deletes it |

All tests use "E2E Test" prefix and clean up after themselves.

---

## What Is Needed to Enable Them

Add these GitHub repository secrets (Settings → Secrets and variables → Actions):

- **E2E_ADMIN_EMAIL** — Admin email (Supabase auth; use the same email you use to sign in)
- **E2E_ADMIN_PASSWORD** — Admin password

The Admin form shows "Enter username" but Supabase expects an email. Use your usual admin email and password.

---

## Run Locally

PowerShell:
```powershell
$env:E2E_ADMIN_EMAIL="your@email.com"; $env:E2E_ADMIN_PASSWORD="yourpass"; npm run test:e2e
```

Bash:
```bash
E2E_ADMIN_EMAIL=your@email.com E2E_ADMIN_PASSWORD=yourpass npm run test:e2e
```

Run only admin tests:
```powershell
$env:E2E_ADMIN_EMAIL="..."; $env:E2E_ADMIN_PASSWORD="..."
npm run test:e2e -- --grep "Admin"
```

---

## Adding tests over time

- Add new admin tests in `e2e/admin-crud.spec.ts` or `e2e/admin-calendar.spec.ts`
- Use `TEST_PREFIX = 'E2E Test '` for test data; clean up in the same test
- Tests run in CI after every deploy when secrets are configured
