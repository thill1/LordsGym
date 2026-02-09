#!/usr/bin/env node
/**
 * Test admin password feature end-to-end.
 * Requires .env.local with SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_ANON_KEY.
 *
 * Flow: create-admin (reset password) → verify login with new password
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) return {};
  const env = {};
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const t = line.trim();
      if (t && !t.startsWith('#')) {
        const eq = t.indexOf('=');
        if (eq > 0) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
      }
    });
  return env;
}

const env = { ...process.env, ...loadEnv() };
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://mrptukahxloqpdqiaxkb.supabase.co';
const ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';

async function resetPassword(serviceRoleKey) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@';
  const password = Array.from({ length: 16 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
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
  const createData = await createRes.json();

  if (createRes.ok) {
    return { password, created: true };
  }

  if (
    createData.msg?.includes('already been registered') ||
    createData.message?.includes('already exists')
  ) {
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    const listData = await listRes.json();
    const user = listData.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (!user?.id) {
      throw new Error('User exists but could not find user id');
    }

    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
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
      throw new Error(err.msg || err.message || 'Failed to update password');
    }
    return { password, created: false };
  }

  throw new Error(createData.msg || createData.message || 'Create failed');
}

async function testLogin(anonKey, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: ADMIN_EMAIL, password }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function main() {
  console.log('🧪 Admin Password Feature Test\n');

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY required in .env.local');
    console.error('   Add it to run the full test.');
    process.exit(1);
  }

  if (!anonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY required in .env.local');
    console.error('   Get from: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api');
    console.error('   Add to .env.local and run: npm run test:admin\n');
    process.exit(1);
  }

  try {
    console.log('1. Resetting admin password...');
    const { password } = await resetPassword(serviceRoleKey);
    console.log('   ✅ Password reset');

    console.log('\n2. Testing login with new password...');
    const { ok, data } = await testLogin(anonKey, password);
    if (!ok) {
      console.error('   ❌ Login failed:', data.error_description || data.msg || data.error);
      process.exit(1);
    }
    console.log('   ✅ Login successful');
    console.log('   User ID:', data.user?.id);
    console.log('   needs_password_change:', data.user?.user_metadata?.needs_password_change);

    console.log('\n✅ Admin password feature test PASSED');
    console.log('\n   Temp password (for manual test):', password);
    console.log('   Login at: https://thill1.github.io/LordsGym/#/admin');
    console.log('   Or: https://lordsgymoutreach.com/admin (if Cloudflare configured)\n');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

main();
