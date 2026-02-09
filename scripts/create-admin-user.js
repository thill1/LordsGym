#!/usr/bin/env node

/**
 * Create admin user for Lord's Gym admin page
 * Email: lordsgymoutreach@gmail.com
 * Password: auto-generated, unique
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

function generatePassword(length = 16) {
  // Avoid $ and chars that can cause shell/copy issues
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  const bytes = randomBytes(length);
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
}

const env = { ...process.env, ...loadEnv() };
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://mrptukahxloqpdqiaxkb.supabase.co';
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';

async function main() {
  console.log('🔐 Create Admin User for Lord\'s Gym\n');
  console.log('   Email:', ADMIN_EMAIL);

  if (!serviceRoleKey) {
    console.error('\n❌ SUPABASE_SERVICE_ROLE_KEY is required.');
    console.error('   Add to .env.local or run: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/create-admin-user.js');
    console.error('   Get it from: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api\n');
    process.exit(1);
  }

  const password = generatePassword(16);

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
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
    console.log('   Login at: https://lordsgymoutreach.com/admin (or /#/admin)\n');
  } else if (data.msg?.includes('already been registered') || data.message?.includes('already exists')) {
    console.log('\n⚠️  User already exists. Resetting password...');

    const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
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

    const newPassword = generatePassword(16);
    const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: newPassword,
        user_metadata: { role: 'admin', needs_password_change: true },
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      console.error('❌ Update failed:', err.msg || err.message);
      process.exit(1);
    }

    console.log('\n✅ Password reset successfully!\n');
    console.log('   Email:   ', ADMIN_EMAIL);
    console.log('   Password:', newPassword);
    console.log('\n⚠️  SAVE THIS PASSWORD – it will not be shown again.');
    console.log('   Login at: https://lordsgymoutreach.com/admin (or /#/admin)\n');
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
