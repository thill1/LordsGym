#!/usr/bin/env node
/**
 * Set admin user password to Admin2026! for lordsgymoutreach@gmail.com
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Run: node scripts/set-admin-password.js
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local not found. Create it with SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  const env = {};
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const env = { ...process.env, ...loadEnv() };
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://mrptukahxloqpdqiaxkb.supabase.co';
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';
const ADMIN_PASSWORD = 'Admin2026!';

async function main() {
  console.log('🔐 Set admin password via Supabase Auth API\n');
  console.log('   Email:', ADMIN_EMAIL);
  console.log('   Password: Admin2026!\n');

  if (!SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required.');
    console.error('   Add it to .env.local');
    console.error('   Get it from: Supabase → Project → Settings → API → service_role (secret)\n');
    process.exit(1);
  }

  const headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  // List users to find lordsgymoutreach@gmail.com
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers });
  const listData = await listRes.json();

  if (!listRes.ok) {
    console.error('❌ Failed to list users:', listData.msg || listData.message || listRes.statusText);
    process.exit(1);
  }

  const user = listData.users?.find((u) => (u.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (user) {
    // Update existing user's password and confirm email
    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'admin', needs_password_change: false },
      }),
    });

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
      console.error('❌ Failed to update password:', updateData.msg || updateData.message || updateRes.statusText);
      process.exit(1);
    }

    console.log('✅ Password updated successfully!');
  } else {
    // Create new user
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'admin', needs_password_change: false },
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      console.error('❌ Failed to create user:', createData.msg || createData.message || createRes.statusText);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
  }

  console.log('\n   Login at: https://lordsgymoutreach.com/#/admin');
  console.log('   Email:', ADMIN_EMAIL);
  console.log('   Password: Admin2026!\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
