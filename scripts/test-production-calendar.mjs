#!/usr/bin/env node
/**
 * Production smoke test: Calendar Management page loads (no infinite spinner)
 * Run: node scripts/test-production-calendar.mjs
 */
import { chromium } from 'playwright';

const ADMIN_URL = 'https://lordsgymoutreach.com/#/admin';
const EMAIL = 'lordsgymoutreach@gmail.com';
const PASSWORD = 'Admin2026!';
const TIMEOUT_MS = 25000;

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(TIMEOUT_MS);

    console.log('1. Navigating to admin login...');
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    console.log('2. Logging in...');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button:has-text("Access Dashboard")');
    await page.waitForSelector('text=Dashboard', { timeout: 15000 });

    console.log('3. Clicking Calendar tab...');
    await page.click('button:has-text("Calendar")');
    await page.waitForSelector('text=Calendar Management', { timeout: 5000 });

    console.log('4. Waiting for calendar to load (max 20s)...');
    // Success: "Add Event" button or table appears. Fail: "Loading events..." still visible after 20s
    const addEventVisible = await page.waitForSelector('button:has-text("Add Event")', { timeout: 20000 }).catch(() => null);
    if (addEventVisible) {
      console.log('SUCCESS: Calendar Management loaded - Add Event button visible.');
      process.exit(0);
    }

    const stillLoading = await page.locator('text=Loading events...').isVisible();
    if (stillLoading) {
      console.error('FAIL: Spinner still visible after 20 seconds.');
      process.exit(1);
    }

    // Table might be visible without Add Event in some layouts
    const hasTable = await page.locator('table').isVisible();
    if (hasTable) {
      console.log('SUCCESS: Calendar table visible.');
      process.exit(0);
    }

    console.log('SUCCESS: Calendar loaded (no infinite spinner).');
    process.exit(0);
  } catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
