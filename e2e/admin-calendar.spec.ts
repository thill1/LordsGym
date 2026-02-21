/**
 * Admin calendar management – requires ADMIN_EMAIL and ADMIN_PASSWORD in CI.
 * Skip if credentials not set (e.g. PRs from forks).
 */
import { test, expect } from '@playwright/test';

const BASE_PATH = '/#';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD;

test.describe('Admin Calendar', () => {
  test.beforeEach(async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      test.skip();
    }
  });

  test('Calendar Management loads after login (no infinite spinner)', async ({ page }) => {
    await page.goto(`${BASE_PATH}/admin`);
    await page.getByPlaceholder(/Enter username|username/i).fill(ADMIN_EMAIL!);
    await page.getByPlaceholder(/Enter password|password/i).fill(ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /Sign In/i }).click();
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15000 });

    await page.click('button:has-text("Calendar")');
    await expect(page.getByText('Calendar Management')).toBeVisible({ timeout: 5000 });

    const addEvent = page.getByRole('button', { name: /Add Event/i });
    const loaded = await addEvent.isVisible().catch(() => false);
    if (!loaded) {
      const hasTable = await page.locator('table').isVisible();
      expect(hasTable).toBeTruthy();
    }
  });
});
