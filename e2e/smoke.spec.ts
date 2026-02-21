/**
 * Production smoke tests – run against deployed site (lords-gym.pages.dev or lordsgymoutreach.com)
 * No auth required. Covers critical public pages and flows.
 */
import { test, expect } from '@playwright/test';

const BASE_PATH = '/#';

test.describe('Public site smoke tests', () => {
  test('Home page loads with hero and testimonials', async ({ page }) => {
    await page.goto(`${BASE_PATH}/`);
    await expect(page.locator('h1')).toContainText(/Train with Purpose|Lord's Gym/i, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /New Arrivals/i })).toBeVisible({ timeout: 5000 });
  });

  test('Shop page loads with products and Add to Cart', async ({ page }) => {
    await page.goto(`${BASE_PATH}/shop`);
    await expect(page.getByRole('heading', { name: /Lord's Gym Store|Store/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Add to Cart/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('Calendar page loads with view options', async ({ page }) => {
    await page.goto(`${BASE_PATH}/calendar`);
    await expect(page.getByText(/Calendar|Community|Outreach|Holiday/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Month|Week|Day|List|Today/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('Membership page loads', async ({ page }) => {
    await page.goto(`${BASE_PATH}/membership`);
    await expect(page.getByText(/Membership|Join|Regular|Student|Annual/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto(`${BASE_PATH}/contact`);
    await expect(page.getByText(/Contact|Send|Message|Email/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Admin login page loads', async ({ page }) => {
    await page.goto(`${BASE_PATH}/admin`);
    await expect(page.getByPlaceholder(/Enter username|username/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Sign In|Access Dashboard|Login/i })).toBeVisible({ timeout: 5000 });
  });

  test('Cart drawer opens from header', async ({ page }) => {
    await page.goto(`${BASE_PATH}/`);
    await page.getByLabel('Cart').first().click();
    await expect(page.getByText('Your cart is empty')).toBeVisible({ timeout: 5000 });
  });
});
