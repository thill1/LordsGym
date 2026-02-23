/**
 * Store product display – public shop, cart, checkout.
 * Admin CRUD is tested by admin-crud.spec.ts.
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
    await expect(page.getByRole('button', { name: 'Checkout Now' })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Cart operations', () => {
  test('reducing quantity to 0 removes item from cart (regression)', async ({ page }) => {
    await page.goto(`${BASE_PATH}/shop`);
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    await expect(page.getByRole('button', { name: 'Checkout Now' })).toBeVisible({ timeout: 10000 });
    const drawer = page.locator('div[class*="translate-x-0"]').filter({ hasText: 'Your Cart' });
    await drawer.getByRole('button', { name: '-', exact: true }).first().click();
    await expect(page.getByText(/Your cart is empty/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Checkout Now' })).not.toBeVisible();
  });

  test('accessories show One Size in cart', async ({ page }) => {
    await page.goto(`${BASE_PATH}/shop`);
    const accessoryCard = page.locator('.group').filter({ hasText: "Scripture Wristbands" }).first();
    await expect(accessoryCard).toBeVisible({ timeout: 10000 });
    await accessoryCard.getByRole('button', { name: /Add to Cart/i }).click();
    await expect(page.getByText('Size: One Size')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Checkout flow', () => {
  test('full flow: shop → cart → checkout → order confirmation', async ({ page }) => {
    test.setTimeout(45000); // 2s simulated payment + navigation
    await page.goto(`${BASE_PATH}/shop`);
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    await expect(page.getByRole('button', { name: 'Checkout Now' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Checkout Now' }).click();

    await expect(page).toHaveURL(/#\/checkout/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('form#checkout-form')).toBeVisible({ timeout: 5000 });

    const form = page.locator('form#checkout-form');
    await form.locator('input[type="email"]').fill('test@example.com');
    await form.locator('input[type="text"]').nth(0).fill('Test');
    await form.locator('input[type="text"]').nth(1).fill('User');
    await form.locator('input[type="text"]').nth(2).fill('123 Main St');
    await form.locator('input[type="text"]').nth(3).fill('Auburn');
    await form.locator('input[type="text"]').nth(4).fill('95603');

    await page.getByRole('button', { name: /Pay \$\d+\.\d+/ }).click();

    await expect(page.getByText('Processing...')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Order Confirmed!')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/#\/order-confirmation/);
  });
});
