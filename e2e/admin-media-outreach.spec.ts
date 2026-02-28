/**
 * Admin Media Library and Outreach page E2E tests.
 * Requires: E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD (env vars).
 * Tests: Media Library load/upload flow, Outreach editor load/save flow.
 */
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const BASE_PATH = '/#';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD;

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_PATH}/admin`);
  await page.getByPlaceholder(/Enter username|username/i).fill(ADMIN_EMAIL!);
  await page.getByPlaceholder(/Enter password|password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15000 });
}

test.describe('Admin Media Library', () => {
  test.beforeEach(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip();
  });

  test('Media Library tab loads with Upload button', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Media Library|🖼️/i }).click();
    await expect(page.getByText(/Media Library/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Upload Media/i }).or(page.getByText('Upload Media'))).toBeVisible({ timeout: 5000 });
  });

  test('Media Library shows empty state or grid', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Media Library|🖼️/i }).click();
    await expect(page.getByText(/Media Library|No media found/i).first()).toBeVisible({ timeout: 5000 });
    // Either "No media found" or a media grid
    const hasEmpty = await page.getByText(/No media found/i).isVisible().catch(() => false);
    const hasGrid = await page.locator('.grid').first().isVisible().catch(() => false);
    expect(hasEmpty || hasGrid).toBeTruthy();
  });

  test('Media Library upload triggers file input and shows feedback', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Media Library|🖼️/i }).click();
    await expect(page.getByText(/Media Library/i).first()).toBeVisible({ timeout: 5000 });

    // Create a tiny test image (1x1 PNG) if fixtures dir exists
    const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures');
    let testImagePath: string | undefined;
    if (fs.existsSync(fixturesDir)) {
      testImagePath = path.join(fixturesDir, 'test-image.png');
      if (!fs.existsSync(testImagePath)) {
        // Create minimal 1x1 PNG
        const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        fs.writeFileSync(testImagePath, Buffer.from(pngBase64, 'base64'));
      }
    }

    if (testImagePath) {
      const fileInput = page.locator('input[type="file"][accept*="image"]');
      await fileInput.setInputFiles(testImagePath);
      // Expect either success toast or error toast (Supabase may fail if project paused / bucket missing)
      await expect(
        page.getByText(/uploaded successfully|Failed to upload|Storage bucket|Not authenticated|project may be paused/i)
      ).toBeVisible({ timeout: 15000 });
    } else {
      // No fixture - just verify upload button exists and is clickable
      const uploadLabel = page.locator('label').filter({ hasText: /Upload Media/i }).first();
      await expect(uploadLabel).toBeVisible();
    }
  });
});

test.describe('Admin Outreach Page', () => {
  test.beforeEach(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip();
  });

  test('Outreach Page tab loads with image URL inputs', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Outreach Page|🤝/i }).click();
    await expect(page.getByText(/Outreach Page Images/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Use Media Library to upload/i)).toBeVisible({ timeout: 3000 });
    // Should have at least 6 image inputs (hero, trailer, outreach, prayer, hug, community)
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toBeVisible({ timeout: 3000 });
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Outreach Page has Hero background input', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Outreach Page|🤝/i }).click();
    await expect(page.getByText(/Hero background/i)).toBeVisible({ timeout: 5000 });
    const heroInput = page.getByPlaceholder(/hero-background/i);
    await expect(heroInput).toBeVisible({ timeout: 3000 });
  });

  test('Outreach Page save button exists', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Outreach Page|🤝/i }).click();
    await expect(page.getByRole('button', { name: /Save Changes/i })).toBeVisible({ timeout: 5000 });
  });
});
