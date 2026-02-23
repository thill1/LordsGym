#!/usr/bin/env node
/**
 * Diagnose admin page - captures DOM, console, network for debugging.
 * Run: node scripts/diagnose-admin-page.mjs
 */
import { chromium } from 'playwright';

const URL = 'https://lordsgymoutreach.com/#/admin';

const errors = [];
const logs = [];
const networkFailures = [];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  context.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') errors.push(text);
    logs.push(`[${type}] ${text}`);
  });

  const page = await context.newPage();
  
  page.on('requestfailed', (req) => {
    networkFailures.push({
      url: req.url(),
      failure: req.failure()?.errorText || 'unknown',
    });
  });

  console.log('Navigating to', URL, '...');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

  console.log('Waiting 5s for page to settle...');
  await page.waitForTimeout(5000);

  const bodyText = await page.locator('body').innerText().catch(() => '(could not get body)');
  const hasLoading = bodyText.includes('Loading');
  const hasSignIn = bodyText.includes('Sign In') || bodyText.includes('Signing in');
  const hasAdminPortal = bodyText.includes('Admin Portal');
  const hasEmailInput = await page.locator('input[type="email"], input[placeholder*="lordsgym"]').count() > 0;

  console.log('\n=== PAGE STATE ===');
  console.log('Has "Loading" text:', hasLoading);
  console.log('Has "Sign In" button:', hasSignIn);
  console.log('Has "Admin Portal" title:', hasAdminPortal);
  console.log('Has email input:', hasEmailInput);
  console.log('\nBody text (first 800 chars):');
  console.log(bodyText.slice(0, 800));

  if (errors.length) {
    console.log('\n=== CONSOLE ERRORS ===');
    errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));
  }

  if (networkFailures.length) {
    console.log('\n=== FAILED NETWORK REQUESTS ===');
    networkFailures.slice(0, 10).forEach((f, i) => console.log(`${i + 1}. ${f.url}\n   ${f.failure}`));
  }

  await page.screenshot({ path: 'admin-page-diagnostic.png' });
  console.log('\nScreenshot saved to admin-page-diagnostic.png');

  await browser.close();
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
