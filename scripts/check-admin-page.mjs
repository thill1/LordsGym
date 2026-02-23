#!/usr/bin/env node
/**
 * Check admin page: load, login form visibility, attempt login, report result.
 * Run: node scripts/check-admin-page.mjs
 */
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'https://lordsgymoutreach.com';
const EMAIL = 'lordsgymoutreach@gmail.com';
const PASSWORD = 'Admin2026!';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const report = {
    pageLoad: null,
    visibleElements: [],
    loginAttempted: false,
    loginSuccess: null,
    loginError: null,
  };

  try {
    await page.goto(BASE_URL + '/#/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(10000);

    const loadingText = await page.getByText('Loading...').first().isVisible().catch(() => false);
    report.pageLoad = loadingText ? 'Stuck on Loading' : 'Loaded';

    const loginFormVisible = await page.getByRole('heading', { name: 'Admin Portal' }).isVisible().catch(() => false);
    const emailInputVisible = await page.getByLabel('Email').isVisible().catch(() => false)
      || await page.getByPlaceholder(/lordsgymoutreach|email/i).isVisible().catch(() => false);
    const anonKeySectionVisible = await page.getByText('Admin login not configured').isVisible().catch(() => false);
    const anonKeyPasteVisible = await page.getByText('Paste your Supabase anon key').isVisible().catch(() => false);
    const dashboardVisible = await page.getByText('Dashboard').first().isVisible().catch(() => false);
    const errorVisible = await page.getByText(/Invalid|error|wrong/i).first().isVisible().catch(() => false);

    if (report.pageLoad === 'Loaded') {
      if (loginFormVisible || emailInputVisible) report.visibleElements.push('Login form');
      if (anonKeySectionVisible || anonKeyPasteVisible) report.visibleElements.push('Anon key paste section');
      if (dashboardVisible) report.visibleElements.push('Dashboard');
      if (errorVisible) report.visibleElements.push('Error message');
      if (report.visibleElements.length === 0) report.visibleElements.push('Other');
    }

    const shouldAttemptLogin = (loginFormVisible || emailInputVisible) && !dashboardVisible;
    if (shouldAttemptLogin) {
      report.loginAttempted = true;
      // Use robust selectors: email input is first type=email, password is first type=password in the form
      await page.locator('input[type="email"]').first().fill(EMAIL);
      await page.locator('form input[type="password"]').first().fill(PASSWORD);
      await page.getByRole('button', { name: /Sign In/i }).click();
      await page.waitForTimeout(4000);

      const errEl = await page.getByText(/Invalid|error|wrong|credentials|email|password/i).first().textContent().catch(() => null);
      const dashEl = await page.getByText('Dashboard').first().isVisible().catch(() => false);

      report.loginSuccess = !!dashEl;
      report.loginError = dashEl ? null : (errEl ? errEl.trim() : 'Unknown');
    }
  } catch (e) {
    report.pageLoad = 'Error: ' + e.message;
  } finally {
    await browser.close();
  }

  console.log('\n--- Admin Page Check Report ---\n');
  console.log('1) Page load:', report.pageLoad);
  console.log('2) Visible UI:', report.visibleElements.join(', ') || '(none)');
  console.log('3) Login attempted:', report.loginAttempted);
  if (report.loginAttempted) {
    console.log('   Success:', report.loginSuccess);
    if (report.loginError) console.log('   Error:', report.loginError);
  }
  console.log('\n');
}

main().catch(console.error);
