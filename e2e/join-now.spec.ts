import { test, expect } from '@playwright/test';

const MODERN_MINDBODY_HOST = 'go.mindbodyonline.com';
const PRICING_PATH = '/book/app/pricing/5743200';

test.describe('Join Now and membership checkout', () => {
  test('home Join Now opens the modern Lord\'s Gym Mindbody catalog', async ({ page }) => {
    await page.goto('/#/');
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Join Now', exact: true }).first().click();
    const popup = await popupPromise;

    await expect.poll(() => popup.url(), { timeout: 15000 }).toContain(`${MODERN_MINDBODY_HOST}${PRICING_PATH}`);
    await expect(popup.getByRole('heading', { name: 'Find the right fit, for you' })).toBeVisible({ timeout: 15000 });
    await expect(popup.getByRole('button', { name: /Month to Month \$39/ }).first()).toBeVisible();
    await expect(popup.getByRole('button', { name: /Online Coaching \$149/ }).first()).toBeVisible();
  });

  test('membership page mirrors the customer-facing Mindbody catalog', async ({ page }) => {
    await page.goto('/#/membership');

    await expect(page.getByRole('heading', { name: 'MEMBERSHIPS & PASSES' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Month to Month' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1 Year Paid In Full' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Day Pass' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Online Coaching', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1 Month Only' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Membership options' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gym Memberships' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flexible Gym Access' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Online Coaching' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Student Monthly' })).toHaveCount(0);
    await expect(page.getByText('Most Popular', { exact: true })).toHaveCount(0);
    await expect(page.getByText('1 item', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Expires 1 month after purchase', { exact: true })).toHaveCount(1);

    const groupHeadings = await page.locator('main section[id] > div > h2').allTextContents();
    expect(groupHeadings).toEqual(['Gym Memberships', 'Flexible Gym Access', 'Online Coaching']);

    const membershipCards = page.locator('#gym-memberships h3');
    await expect(membershipCards).toHaveText(['Month to Month', '1 Year Paid In Full']);
    const flexibleCards = page.locator('#flexible-access h3');
    await expect(flexibleCards).toHaveText(['Day Pass', '1 Month Only']);
    await expect(page.locator('#online-coaching h3')).toHaveText('Online Coaching');

    await page.getByRole('button', { name: 'Flexible Gym Access' }).click();
    await expect.poll(async () => page.locator('#flexible-access').evaluate((element) => Math.round(element.getBoundingClientRect().top)))
      .toBeLessThan(140);

    const mindbodyLinks = page.locator(`a[href*="${MODERN_MINDBODY_HOST}${PRICING_PATH}"]`);
    await expect(mindbodyLinks).toHaveCount(5);
    await expect(page.locator('a[href*="clients.mindbodyonline.com"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'View Membership Options' }))
      .toHaveAttribute('href', `https://${MODERN_MINDBODY_HOST}${PRICING_PATH}?category=contract`);
    await expect(page.locator('#gym-memberships a')).toHaveCount(2);
    await expect(page.locator('#flexible-access a')).toHaveCount(2);
    await expect(page.locator('#online-coaching a'))
      .toHaveAttribute('href', `https://${MODERN_MINDBODY_HOST}${PRICING_PATH}?category=contract`);
  });

  test('direct /membership route renders the membership page', async ({ page }) => {
    const response = await page.goto('/membership');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'MEMBERSHIPS & PASSES' })).toBeVisible();
  });

  test('day pass opens the current Mindbody pass catalog', async ({ page }) => {
    await page.goto('/#/membership');
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'View Day Pass Options' }).click();
    const popup = await popupPromise;
    await expect.poll(() => popup.url(), { timeout: 15000 }).toContain(`${PRICING_PATH}?category=passesAndPacks`);
    await expect(popup.getByText(/Day Pass/).first()).toBeVisible({ timeout: 15000 });
    await expect(popup.getByText(/1 Year Paid In Full/).first()).toBeVisible();
  });

  test('mobile Join Now opens the pricing catalog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/');
    await page.getByRole('button', { name: /menu/i }).first().click();
    const joinLink = page.getByRole('link', { name: 'Join Now' });
    await expect(joinLink).toHaveAttribute('href', `https://${MODERN_MINDBODY_HOST}${PRICING_PATH}`);
  });

  test('dismissing a popup preserves the current page', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('site_settings', JSON.stringify({
        popupModals: [{
          id: 'e2e-popup',
          enabled: true,
          title: 'Test offer',
          body: 'Test popup body',
          targetPage: 'all',
          showAfterDelayMs: 0,
          showOncePerSession: true,
        }],
      }));
    });
    await page.goto('/#/membership');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.getByRole('button', { name: 'Close' }).first().click();
    await expect(page).toHaveURL(/#\/membership$/);
    await expect(page.getByRole('heading', { name: 'MEMBERSHIPS & PASSES' })).toBeVisible();
  });

  test('training separates online coaching purchase from 1-on-1 inquiries', async ({ page }) => {
    await page.goto('/#/training');
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'View Coaching Plans' }).click();
    const popup = await popupPromise;
    await expect.poll(() => popup.url(), { timeout: 15000 }).toContain(`${MODERN_MINDBODY_HOST}${PRICING_PATH}`);

    await page.getByRole('button', { name: 'Ask About This Offer' }).click();
    await expect(page).toHaveURL(/#\/contact\?/);
    await expect(page.locator('select[name="inquiryType"]')).toHaveValue('1on1 Coaching');
  });

  test('program schedule leads to the actual calendar', async ({ page }) => {
    await page.goto('/#/programs');
    await page.getByRole('button', { name: 'View Calendar' }).click();
    await expect(page).toHaveURL(/#\/calendar$/);
    await expect(page.getByRole('button', { name: /Month|Week|Day|List|Today/i }).first()).toBeVisible();
  });
});
