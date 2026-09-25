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

  test('light mode keeps the header, testimonials, and About page readable', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto(`${BASE_PATH}/`);

    const membershipNav = page.locator('header nav').getByRole('button', { name: 'Membership', exact: true });
    await expect(membershipNav).toBeVisible();
    await expect(membershipNav).toHaveCSS('color', 'rgb(26, 26, 26)');

    const testimonial = page.locator('section').filter({ hasText: 'What Our Community Says' }).locator('.italic').first();
    await expect(testimonial).toBeVisible();
    await expect(testimonial).toHaveCSS('color', 'rgb(64, 64, 64)');

    await page.goto(`${BASE_PATH}/about`);
    const aboutSection = page.locator('section').first();
    await expect(aboutSection).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    await expect(page.getByRole('heading', { name: /About Lord.s Gym/i })).toBeVisible();
  });

  test('Shop page loads with live merchandise', async ({ page }) => {
    await page.goto(`${BASE_PATH}/shop`);
    await expect(page.getByRole('heading', { name: /Lord's Gym Store|Store/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Buy on MindBody/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Calendar page loads with view options', async ({ page }) => {
    await page.goto(`${BASE_PATH}/calendar`);
    await expect(page.getByText(/Calendar|Community|Outreach|Holiday/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Month|Week|Day|List|Today/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('Membership page loads', async ({ page }) => {
    await page.goto(`${BASE_PATH}/membership`);
    await expect(page.getByText(/Membership|Join|Month to Month|Annual/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto(`${BASE_PATH}/contact`);
    await expect(page.getByText(/Contact|Send|Message|Email/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Admin login page loads', async ({ page }) => {
    await page.goto(`${BASE_PATH}/admin`);
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByPlaceholder('lordsgymoutreach@gmail.com')).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder('Enter password')).toBeVisible({ timeout: 5000 });
  });

  test('Cart drawer opens from header', async ({ page }) => {
    await page.goto(`${BASE_PATH}/`);
    await page.getByLabel('Cart').first().click();
    await expect(page.getByText('Your cart is empty')).toBeVisible({ timeout: 5000 });
  });

  test('stale device content does not replace the current site', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('home_content_v2', JSON.stringify({
        hero: { headline: 'STALE DEVICE HEADLINE', subheadline: 'Old copy', ctaText: 'Join Now' },
        values: {},
      }));
    });
    await page.goto(`${BASE_PATH}/`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).not.toContainText('STALE DEVICE HEADLINE');
  });

  test('public page load does not write site content to Supabase', async ({ page }) => {
    const contentWrites: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (
        /\/rest\/v1\/(settings|home_content|outreach_content|testimonials)/.test(url) &&
        !['GET', 'HEAD'].includes(request.method())
      ) contentWrites.push(`${request.method()} ${url}`);
    });
    await page.goto(`${BASE_PATH}/`);
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForTimeout(1200);
    expect(contentWrites).toEqual([]);
  });

  test('a previously visited membership page remains usable offline', async ({ page, context }) => {
    await page.goto(`${BASE_PATH}/`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Allow the service worker to control the page and cache the app shell.
    await page.reload();
    await page.goto(`${BASE_PATH}/membership`);
    await expect(page.getByRole('heading', { name: 'MEMBERSHIPS & PASSES' })).toBeVisible();

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'MEMBERSHIPS & PASSES' })).toBeVisible();
  });
});
