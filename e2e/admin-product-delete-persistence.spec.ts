/**
 * Deterministic test: product delete persists to database.
 *
 * Proves the full chain: create in DB → delete via Admin UI → verify product gone from DB.
 * This guards against the regression where deleted products reappeared (sync-from-constants,
 * or delete not actually reaching Supabase).
 *
 * Requires: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
 * Run: node --env-file=.env.local scripts/run-e2e-with-env.mjs e2e/admin-product-delete-persistence.spec.ts
 */
import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BASE_PATH = '/#';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_PREFIX = 'E2E DeletePersist ';

function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_PATH}/admin`);
  await page.getByPlaceholder(/Enter username|username/i).fill(ADMIN_EMAIL!);
  await page.getByPlaceholder(/Enter password|password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15000 });
}

test.describe('Product delete persistence (DB verification)', () => {
  test.beforeEach(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip();
    if (!getSupabase()) {
      test.skip(true, 'SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL required for DB verification');
    }
  });

  test('deleted product is removed from database', async ({ page }) => {
    const supabase = getSupabase()!;
    const productId = `e2e-delete-persist-${Date.now()}`;
    const testTitle = `${TEST_PREFIX}${productId}`;

    // 1. Insert product directly into DB (service role bypasses RLS)
    const { error: insertErr } = await supabase.from('products').insert({
      id: productId,
      title: testTitle,
      price: 9.99,
      category: "Men's Apparel",
      image: '',
      image_coming_soon: false,
      featured: false,
      updated_at: new Date().toISOString(),
    });
    if (insertErr) {
      throw new Error(`Failed to insert test product: ${insertErr.message}`);
    }

    // Verify it exists
    const { data: before } = await supabase.from('products').select('id').eq('id', productId).single();
    expect(before?.id).toBe(productId);

    // 2. Delete via Admin UI
    await login(page);
    await page.getByRole('button', { name: /Store|Merch/i }).click();
    await expect(page.getByText('Store Manager')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });

    await page.getByRole('row', { name: new RegExp(testTitle) }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(/Are you sure|Delete Product/i)).toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: /Confirm|Delete/i }).click();
    await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 });

    // 3. Verify product is gone from database (deterministic assertion)
    const { data: after } = await supabase.from('products').select('id').eq('id', productId).maybeSingle();
    expect(after).toBeNull();
  });
});
