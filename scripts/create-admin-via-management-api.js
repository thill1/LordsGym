#!/usr/bin/env node

/**
 * Create admin user via Supabase Management API
 * 1. Fetch service_role key from Management API
 * 2. Create user via Auth Admin API
 */

import { readFileSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach((line) => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  });
  return env;
}

function generatePassword(length = 14) {
  // Avoid % and chars that can cause copy/paste or encoding issues
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  const bytes = randomBytes(length);
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
}

const env = { ...process.env, ...loadEnv() };
const accessToken = env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'mrptukahxloqpdqiaxkb';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';

async function getServiceRoleKey() {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get API keys: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    const sr = data.find((k) => k.name === 'service_role' || k.tags?.includes('service_role'));
    return sr?.api_key;
  }
  return data.service_role || data.service_role_key;
}

async function main() {
  console.log('🔐 Create Admin User via Supabase Management API\n');

  if (!accessToken) {
    console.error('❌ SUPABASE_ACCESS_TOKEN is required.');
    console.error('   Get it from: https://supabase.com/dashboard/account/tokens\n');
    process.exit(1);
  }

  let serviceRoleKey;
  try {
    console.log('   Fetching service_role key...');
    serviceRoleKey = await getServiceRoleKey();
    if (!serviceRoleKey) throw new Error('service_role key not returned');
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }

  const password = generatePassword(16);

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', needs_password_change: true },
    }),
  });

  const data = await res.json();

  if (res.ok) {
    console.log('\n✅ Admin user created successfully!\n');
    console.log('   Email:   ', ADMIN_EMAIL);
    console.log('   Password:', password);
    console.log('\n⚠️  SAVE THIS PASSWORD – it will not be shown again.');
    console.log('   On first login, they must change it.');
    console.log('   Login at: https://lordsgymoutreach.com/admin\n');
  } else if (data.msg?.includes('already been registered') || data.message?.includes('already exists')) {
    console.log('\n⚠️  User already exists. Updating password...');
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    const listData = await listRes.json();
    const user = listData.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    const userId = user?.id;
    if (!userId) {
      console.error('   Could not find user.');
      process.exit(1);
    }
    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
        user_metadata: { role: 'admin', needs_password_change: true },
      }),
    });
    if (!updateRes.ok) {
      const err = await updateRes.json();
      console.error('❌ Update failed:', err.msg || err.message);
      process.exit(1);
    }
    console.log('\n✅ Password updated!\n');
    console.log('   Email:   ', ADMIN_EMAIL);
    console.log('   Password:', password);
    console.log('\n⚠️  SAVE THIS PASSWORD – give to client.');
    console.log('   Login at: https://lordsgymoutreach.com/admin\n');
  } else {
    console.error('\n❌ Failed:', data.msg || data.message || data.error || res.statusText);
    console.error('   Response:', JSON.stringify(data, null, 2), '\n');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
