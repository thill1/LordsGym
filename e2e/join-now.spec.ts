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

  test('membership page exposes current memberships, annual pass, coaching, and day pass', async ({ page }) => {
    await page.goto('/#/membership');

    await expect(page.getByRole('heading', { name: 'MEMBERSHIPS & PASSES' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Month to Month' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1 Year Paid In Full' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Day Pass' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Online Coaching' })).toBeVisible();

    const mindbodyLinks = page.locator(`a[href*="${MODERN_MINDBODY_HOST}${PRICING_PATH}"]`);
    await expect(mindbodyLinks).toHaveCount(5);
    await expect(page.locator('a[href*="clients.mindbodyonline.com"]')).toHaveCount(0);
  });

  test('direct /membership route renders the membership page', async ({ page }) => {
    await page.goto('/membership');
    await expect(page.getByRole('heading', { name: 'MEMBERSHIPS & PASSES' })).toBeVisible();
  });

  test('day pass opens the current Mindbody pass catalog', async ({ page }) => {
    await page.goto('/#/membership');
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Buy a Day Pass' }).click();
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

  test('student rate inquiry reaches the contact form with context', async ({ page }) => {
    await page.goto('/#/membership');
    await page.getByRole('link', { name: 'Ask About Student Rate' }).click();
    await expect(page).toHaveURL(/#\/contact\?/);
    await expect(page.getByRole('heading', { name: 'Send a Message' })).toBeVisible();
    await expect(page.locator('select[name="inquiryType"]')).toHaveValue('Membership Question');
    await expect(page.locator('textarea[name="message"]')).toHaveValue(/Student Monthly/);
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
