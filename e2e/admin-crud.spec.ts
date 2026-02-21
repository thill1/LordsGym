/**
 * Admin CRUD E2E tests – Store, Testimonials, Calendar.
 * Requires E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.
 * Uses unique test data (E2E Test prefix) and cleans up after runs.
 */
import { test, expect } from '@playwright/test';

const BASE_PATH = '/#';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD;
const TEST_PREFIX = 'E2E Test ';

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_PATH}/admin`);
  await page.getByPlaceholder(/Enter username|username/i).fill(ADMIN_EMAIL!);
  await page.getByPlaceholder(/Enter password|password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15000 });
}

test.describe('Admin CRUD', () => {
  test.beforeEach(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip();
  });

  test.describe('Store CRUD', () => {
    test('add, edit, and delete product', async ({ page }) => {
      await login(page);
      await page.getByRole('button', { name: /Store|Merch/i }).click();
      await expect(page.getByText('Store Manager')).toBeVisible({ timeout: 5000 });

      const testTitle = `${TEST_PREFIX}Product ${Date.now()}`;
      const editedTitle = `${TEST_PREFIX}Edited ${Date.now()}`;

      // Add
      await page.getByRole('button', { name: 'Add New Product' }).click();
      await expect(page.getByRole('heading', { name: /Add New Product/i })).toBeVisible({ timeout: 3000 });
      await page.getByLabel(/Product Title/i).fill(testTitle);
      await page.getByLabel(/Price/i).first().fill('9.99');
      await page.getByRole('button', { name: 'Save Product' }).click();
      await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });

      // Edit
      await page.getByRole('row', { name: new RegExp(testTitle) }).getByRole('button', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Edit Product/i })).toBeVisible({ timeout: 3000 });
      await page.getByLabel(/Product Title/i).fill(editedTitle);
      await page.getByRole('button', { name: 'Save Product' }).click();
      await expect(page.getByText(editedTitle)).toBeVisible({ timeout: 10000 });

      // Delete
      await page.getByRole('row', { name: new RegExp(editedTitle) }).getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText(/Are you sure|Delete Product/i)).toBeVisible({ timeout: 3000 });
      await page.getByRole('button', { name: /Confirm|Delete/i }).click();
      await expect(page.getByText(editedTitle)).not.toBeVisible({ timeout: 10000 });
    });

    test('bulk delete products', async ({ page }) => {
      await login(page);
      await page.getByRole('button', { name: /Store|Merch/i }).click();
      await expect(page.getByText('Store Manager')).toBeVisible({ timeout: 5000 });

      const testId = Date.now();
      const titles: string[] = [];
      for (let i = 0; i < 2; i++) {
        const t = `${TEST_PREFIX}Bulk ${testId}-${i}`;
        titles.push(t);
        await page.getByRole('button', { name: 'Add New Product' }).click();
        await page.getByLabel(/Product Title/i).fill(t);
        await page.getByLabel(/Price/i).first().fill('5.00');
        await page.getByRole('button', { name: 'Save Product' }).click();
        await expect(page.getByText(t)).toBeVisible({ timeout: 10000 });
      }

      // Select both and bulk delete
      const checkboxes = page.getByRole('row', { name: new RegExp(titles[0]) }).locator('input[type="checkbox"]');
      await checkboxes.first().check();
      await page.getByRole('row', { name: new RegExp(titles[1]) }).locator('input[type="checkbox"]').first().check();
      await page.getByRole('button', { name: /Delete Selected/i }).click();
      await page.getByRole('button', { name: /Confirm|Delete/i }).click();

      await expect(page.getByText(titles[0])).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByText(titles[1])).not.toBeVisible({ timeout: 5000 });
    });

    test('admin-created product appears on public Store', async ({ page }) => {
      await login(page);
      await page.getByRole('button', { name: /Store|Merch/i }).click();
      await expect(page.getByText('Store Manager')).toBeVisible({ timeout: 5000 });

      const testTitle = `${TEST_PREFIX}Store ${Date.now()}`;

      // Create product in Admin
      await page.getByRole('button', { name: 'Add New Product' }).click();
      await expect(page.getByRole('heading', { name: /Add New Product/i })).toBeVisible({ timeout: 3000 });
      await page.getByLabel(/Product Title/i).fill(testTitle);
      await page.getByLabel(/Price/i).first().fill('12.99');
      await page.getByRole('button', { name: 'Save Product' }).click();
      await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });

      // Navigate to public Store and verify product appears
      await page.goto(`${BASE_PATH}/shop`);
      await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /Add to Cart/i }).first()).toBeVisible({ timeout: 5000 });

      // Cleanup: remove product from Admin
      await page.goto(`${BASE_PATH}/admin`);
      await page.getByRole('button', { name: /Store|Merch/i }).click();
      await page.getByRole('row', { name: new RegExp(testTitle) }).getByRole('button', { name: 'Delete' }).click();
      await page.getByRole('button', { name: /Confirm|Delete/i }).click();
      await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 });
    });

    test('image coming soon product shows placeholder on Store', async ({ page }) => {
      await login(page);
      await page.getByRole('button', { name: /Store|Merch/i }).click();
      await expect(page.getByText('Store Manager')).toBeVisible({ timeout: 5000 });

      const testTitle = `${TEST_PREFIX}ComingSoon ${Date.now()}`;

      // Create product with "Image coming soon" checked
      await page.getByRole('button', { name: 'Add New Product' }).click();
      await expect(page.getByRole('heading', { name: /Add New Product/i })).toBeVisible({ timeout: 3000 });
      await page.getByLabel(/Product Title/i).fill(testTitle);
      await page.getByLabel(/Price/i).first().fill('5.00');
      await page.getByLabel(/Image coming soon/i).check();
      await page.getByRole('button', { name: 'Save Product' }).click();
      await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });

      // Navigate to Store and verify "Coming soon" placeholder appears for this product
      await page.goto(`${BASE_PATH}/shop`);
      await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/Coming soon: Lord's Gym merch/i)).toBeVisible({ timeout: 5000 });

      // Cleanup
      await page.goto(`${BASE_PATH}/admin`);
      await page.getByRole('button', { name: /Store|Merch/i }).click();
      await page.getByRole('row', { name: new RegExp(testTitle) }).getByRole('button', { name: 'Delete' }).click();
      await page.getByRole('button', { name: /Confirm|Delete/i }).click();
      await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Testimonials CRUD', () => {
    test('add, edit, and delete testimonial', async ({ page }) => {
      await login(page);
      await page.getByRole('button', { name: 'Testimonials' }).click();
      await expect(page.getByText(/Testimonials|Testimonial/i)).toBeVisible({ timeout: 5000 });

      const testName = `${TEST_PREFIX}T ${Date.now()}`;
      const testQuote = 'E2E test quote for testimonial CRUD.';
      const editedQuote = 'E2E test quote - edited.';

      // Add
      await page.getByRole('button', { name: 'Add Testimonial' }).click();
      await page.getByPlaceholder('John Doe').fill(testName);
      await page.getByPlaceholder('Member').fill('E2E Tester');
      await page.getByPlaceholder(/This gym has changed|quote/i).fill(testQuote);
      await page.getByRole('button', { name: 'Add Testimonial' }).click();
      await expect(page.getByText(testName)).toBeVisible({ timeout: 10000 });

      // Edit
      await page.getByRole('row', { name: new RegExp(testName) }).getByRole('button', { name: /Edit/i }).click();
      await page.getByPlaceholder(/Quote|quote/i).fill(editedQuote);
      await page.getByRole('button', { name: /Update Testimonial/i }).click();
      await expect(page.getByText(editedQuote)).toBeVisible({ timeout: 10000 });

      // Delete
      await page.getByRole('row', { name: new RegExp(testName) }).getByRole('button', { name: /Delete/i }).click();
      await page.getByRole('button', { name: /Confirm|Delete/i }).click();
      await expect(page.getByText(testName)).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Calendar CRUD', () => {
    test('add and delete event', async ({ page }) => {
      await login(page);
      await page.getByRole('button', { name: 'Calendar' }).click();
      await expect(page.getByText('Calendar Management')).toBeVisible({ timeout: 5000 });

      const testTitle = `${TEST_PREFIX}Event ${Date.now()}`;

      // Add
      await page.getByRole('button', { name: /Add Event/i }).click();
      await page.getByLabel('Title').fill(testTitle);
      await page.getByLabel('Event Type').selectOption('community');
      const tomorrow = new Date(Date.now() + 86400000);
      const startStr = tomorrow.toISOString().slice(0, 16);
      const endDate = new Date(tomorrow.getTime() + 3600000);
      const endStr = endDate.toISOString().slice(0, 16);
      await page.getByLabel('Start Time').fill(startStr);
      await page.getByLabel('End Time').fill(endStr);
      await page.getByRole('button', { name: 'Create Event' }).click();
      await expect(page.getByText(testTitle)).toBeVisible({ timeout: 15000 });

      // Delete
      const row = page.getByRole('row', { name: new RegExp(testTitle) });
      await row.getByRole('button', { name: /Delete|Remove/i }).click();
      await page.getByRole('button', { name: /Confirm|Delete/i }).click();
      await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 });
    });
  });
});
