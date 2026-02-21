/**
 * Admin Google Reviews import E2E test.
 * Mocks the Edge Function response so no real API calls are made.
 * Requires: E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD.
 * Also requires VITE_GOOGLE_PLACE_ID in the deployed build (otherwise Fetch Reviews
 * shows config error and never fires the request we mock).
 */
import { test, expect } from '@playwright/test';

const BASE_PATH = '/#';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD;
const TEST_PREFIX = 'E2E Google ';

const MOCK_REVIEWS = {
  reviews: [
    {
      id: `e2e-mock-${Date.now()}`,
      name: `${TEST_PREFIX}User`,
      role: 'Google Review',
      quote: 'E2E mock review - best gym ever!',
    },
  ],
};

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_PATH}/admin`);
  await page.getByPlaceholder(/Enter username|username/i).fill(ADMIN_EMAIL!);
  await page.getByPlaceholder(/Enter password|password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15000 });
}

test.describe('Google Reviews import', () => {
  test.beforeEach(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip();
  });

  test('fetch reviews (mocked), import selected, see in table with Google badge', async ({ page }) => {
    // Intercept Edge Function call – return mock data so no real API is hit
    await page.route('**/functions/v1/google-reviews*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_REVIEWS),
      });
    });

    await login(page);
    await page.getByRole('button', { name: 'Testimonials' }).click();
    await expect(page.getByText(/Testimonials|Testimonial/i)).toBeVisible({ timeout: 5000 });

    // Fetch Reviews – our mock will respond
    await page.getByRole('button', { name: 'Fetch Reviews' }).click();

    // Wait for loading to finish and mock review to appear
    await expect(page.getByText(MOCK_REVIEWS.reviews[0].name)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(MOCK_REVIEWS.reviews[0].quote)).toBeVisible({ timeout: 2000 });

    // Select and import
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();
    await page.getByRole('button', { name: /Import Selected/i }).click();

    // Verify imported testimonial appears in table with Google badge
    await expect(page.getByText(MOCK_REVIEWS.reviews[0].name)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Google')).toBeVisible({ timeout: 5000 });

    // Cleanup: delete the imported testimonial
    const row = page.getByRole('row', { name: new RegExp(MOCK_REVIEWS.reviews[0].name) });
    await row.getByRole('button', { name: /Delete/i }).click();
    await page.getByRole('button', { name: /Confirm|Delete/i }).click();
    await expect(page.getByText(MOCK_REVIEWS.reviews[0].name)).not.toBeVisible({ timeout: 10000 });
  });
});
