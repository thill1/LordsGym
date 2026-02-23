#!/usr/bin/env node
/**
 * Fix Supabase Auth URL config (site_url + redirect URLs) via Management API.
 * Addresses misconfiguration that can break auth flows in production.
 *
 * Usage: node --env-file=.env.local scripts/fix-supabase-auth-urls.mjs
 *
 * Requires: SUPABASE_ACCESS_TOKEN in .env.local
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PROJECT_REF = 'mrptukahxloqpdqiaxkb';

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return {};
  const env = {};
  readFileSync(path, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
  return { ...env, ...process.env };
}

const env = loadEnv();
const token = env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error('❌ SUPABASE_ACCESS_TOKEN required. Set in .env.local');
  process.exit(1);
}

const SITE_URL = 'https://lords-gym.pages.dev';
const REDIRECT_URLS = [
  'https://lords-gym.pages.dev',
  'https://lords-gym.pages.dev/**',
  'https://lords-gym.pages.dev/#/**',
  'https://lordsgymoutreach.com',
  'https://lordsgymoutreach.com/**',
  'https://lordsgymoutreach.com/#/**',
  'http://localhost:5173',
  'http://localhost:5173/**',
  'http://localhost:3000',
  'http://localhost:3000/**',
];

async function main() {
  console.log('🔧 Fix Supabase Auth URL Config\n');

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const current = await res.json();
  if (!res.ok) {
    console.error('❌ Failed to read auth config:', current?.message || res.statusText);
    process.exit(1);
  }

  const existingRedirects = (current.uri_allow_list || '').split(',').map((s) => s.trim()).filter(Boolean);
  const merged = [...new Set([...existingRedirects, ...REDIRECT_URLS])];

  const payload = {
    site_url: SITE_URL,
    uri_allow_list: merged.join(','),
  };

  const updateRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await updateRes.json();
  if (!updateRes.ok) {
    console.error('❌ Failed to update:', data?.message || updateRes.statusText);
    process.exit(1);
  }

  console.log('✅ Auth URL config updated');
  console.log('   site_url:', SITE_URL);
  console.log('   redirect URLs:', merged.length, 'entries');
  console.log('\nRetry admin login at https://lords-gym.pages.dev/admin');
}

main().catch((e) => {
  console.error('❌', e.message || e);
  process.exit(1);
});
