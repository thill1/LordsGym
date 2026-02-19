#!/usr/bin/env node
/**
 * Configure Supabase Google OAuth via Management API.
 *
 * Usage:
 *   node scripts/configure-google-oauth.js --check
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx GOOGLE_OAUTH_CLIENT_ID=xxx GOOGLE_OAUTH_CLIENT_SECRET=xxx node scripts/configure-google-oauth.js
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const envPath = join(root, '.env.local');
  if (!existsSync(envPath)) return {};
  const env = {};
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return;
      const eq = t.indexOf('=');
      if (eq <= 0) return;
      const key = t.slice(0, eq).trim();
      const value = t.slice(eq + 1).trim();
      env[key] = value;
    });
  return env;
}

const env = { ...loadEnv(), ...process.env };
const isCheckOnly = process.argv.includes('--check');

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://mrptukahxloqpdqiaxkb.supabase.co';
const PROJECT_REF = env.SUPABASE_PROJECT_REF || new URL(SUPABASE_URL).hostname.split('.')[0];

const PROD_REDIRECT = 'https://lordsgymoutreach.com/admin';
const LOCAL_REDIRECT = 'http://localhost:5173/admin';

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function checkPublicSettings() {
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is required for --check.');
    process.exit(1);
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: anonKey },
  });
  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Failed to read auth settings:', data?.message || res.statusText);
    process.exit(1);
  }

  console.log('✅ Supabase auth settings fetched');
  console.log('   Google enabled:', !!data?.external?.google);
  return !!data?.external?.google;
}

async function main() {
  console.log('🔐 Configure Google OAuth for Admin\n');
  console.log('   Project ref:', PROJECT_REF);

  if (isCheckOnly) {
    await checkPublicSettings();
    return;
  }

  const managementToken = env.SUPABASE_ACCESS_TOKEN;
  const googleClientId = env.GOOGLE_OAUTH_CLIENT_ID || env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;

  if (!managementToken || !googleClientId || !googleClientSecret) {
    console.error('\n❌ Missing required env vars for configure mode.');
    console.error('   Required: SUPABASE_ACCESS_TOKEN, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET');
    console.error('   Tip: run with --check to only verify current provider state.');
    process.exit(1);
  }

  const siteUrl = env.ADMIN_OAUTH_SITE_URL || 'https://lordsgymoutreach.com';
  const requestedRedirects = parseCsv(env.ADMIN_OAUTH_REDIRECT_URLS);
  const requiredRedirects = [...new Set([LOCAL_REDIRECT, PROD_REDIRECT, ...requestedRedirects])];

  const getConfigRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    headers: {
      Authorization: `Bearer ${managementToken}`,
      'Content-Type': 'application/json',
    },
  });
  const currentConfig = await getConfigRes.json();
  if (!getConfigRes.ok) {
    console.error('\n❌ Failed to read auth config:', currentConfig?.message || getConfigRes.statusText);
    process.exit(1);
  }

  const existingAllowlist = parseCsv(currentConfig.uri_allow_list);
  const mergedAllowlist = [...new Set([...existingAllowlist, ...requiredRedirects])];

  const payload = {
    external_google_enabled: true,
    external_google_client_id: googleClientId,
    external_google_secret: googleClientSecret,
    site_url: siteUrl,
    uri_allow_list: mergedAllowlist.join(','),
  };

  const updateRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${managementToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const updateData = await updateRes.json();
  if (!updateRes.ok) {
    console.error('\n❌ Failed to update Google OAuth config:', updateData?.message || updateRes.statusText);
    process.exit(1);
  }

  console.log('\n✅ Google OAuth config updated.');
  console.log('   site_url:', payload.site_url);
  console.log('   uri_allow_list includes:');
  mergedAllowlist.forEach((uri) => console.log(`   - ${uri}`));
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error.message || error);
  process.exit(1);
});
