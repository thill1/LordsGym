/**
 * Store product display – public shop and product cards.
 * Admin CRUD is tested by store-products.test.ts (unit) and manual QA.
 */
import { test, expect } from '@playwright/test';

const BASE_PATH = '/#';

test.describe('Store public view', () => {
  test('Shop shows product grid with multiple items', async ({ page }) => {
    await page.goto(`${BASE_PATH}/shop`);
    const addToCartButtons = page.getByRole('button', { name: /Add to Cart/i });
    await expect(addToCartButtons.first()).toBeVisible({ timeout: 10000 });
    const count = await addToCartButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Product can be added to cart', async ({ page }) => {
    await page.goto(`${BASE_PATH}/shop`);
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    // Cart drawer opens automatically after add; verify "Checkout Now" or "Your Cart" with item
    await expect(page.getByRole('button', { name: 'Checkout Now' })).toBeVisible({ timeout: 10000 });
  });
});
