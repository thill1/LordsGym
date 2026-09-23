/**
 * Current public merchandise view. Merchandise purchase is delegated to
 * Mindbody; the old local Add to Cart / simulated payment tests did not match
 * the production shop and cannot establish checkout readiness.
 */
import { test, expect } from '@playwright/test';

test.describe('Store public view', () => {
  test('loads products from Supabase with purchase actions', async ({ page }) => {
    await page.goto('/#/shop');
    await expect(page.getByRole('heading', { name: "Lord's Gym Store" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buy on MindBody' }).first()).toBeVisible({ timeout: 10000 });
    expect(await page.getByRole('button', { name: 'Buy on MindBody' }).count()).toBeGreaterThan(1);
  });

  test('category filter narrows the visible products', async ({ page }) => {
    await page.goto('/#/shop');
    await expect(page.getByRole('button', { name: 'Buy on MindBody' }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: "Men's Apparel", exact: true }).click();
    await expect(page.getByRole('button', { name: 'Buy on MindBody' }).first()).toBeVisible();
  });

  test('shows an honest retry state when merchandise cannot load', async ({ page }) => {
    await page.route('**/rest/v1/products**', route => route.fulfill({ status: 503, body: '{"message":"unavailable"}' }));
    await page.goto('/#/shop');
    await expect(page.getByRole('alert')).toContainText('Merchandise is temporarily unavailable');
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
    await expect(page.getByText('No products found in this category.')).toHaveCount(0);
  });
});
