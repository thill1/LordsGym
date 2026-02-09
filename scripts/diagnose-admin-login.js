#!/usr/bin/env node
/**
 * Diagnose admin login issues.
 * Run: node scripts/diagnose-admin-login.js
 * Or with password: node scripts/diagnose-admin-login.js <password>
 */

const SUPABASE_URL = 'https://mrptukahxloqpdqiaxkb.supabase.co';
const ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';
const PASSWORD = process.argv[2];

async function main() {
  console.log('🔍 Admin Login Diagnostic\n');
  console.log('1. Checking Supabase Auth API...');

  // Test with no auth (should get "Invalid API key")
  const noKeyRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: 'invalid' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: 'test' }),
  });
  const noKeyData = await noKeyRes.json();

  if (noKeyData.message?.includes('Invalid API key')) {
    console.log('   ✅ Supabase API reachable (expects valid anon key)');
  } else {
    console.log('   ⚠️  Unexpected response:', JSON.stringify(noKeyData).slice(0, 100));
  }

  if (!PASSWORD) {
    console.log('\n2. No password provided.');
    console.log('   Run: npm run create-admin (with SUPABASE_SERVICE_ROLE_KEY in .env.local)');
    console.log('   Then: node scripts/diagnose-admin-login.js <password>\n');
    return;
  }

  console.log('\n2. Testing login (need anon key from .env.local or as VITE_SUPABASE_ANON_KEY)...');
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!anonKey) {
    console.log('   ❌ VITE_SUPABASE_ANON_KEY not set.');
    console.log('   Get from: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api');
    console.log('   Run: VITE_SUPABASE_ANON_KEY=your_key node scripts/diagnose-admin-login.js', PASSWORD.replace(/./g, '*'), '\n');
    return;
  }

  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: PASSWORD }),
  });
  const loginData = await loginRes.json();

  if (loginRes.ok) {
    console.log('   ✅ Login successful!');
    console.log('   User ID:', loginData.user?.id);
    console.log('\n   If the site still fails, the deployed build may not have the anon key.');
    console.log('   Add VITE_SUPABASE_ANON_KEY to GitHub Secrets and redeploy.\n');
  } else {
    console.log('   ❌ Login failed:', loginData.error_description || loginData.msg || loginData.error);
    if (loginData.error === 'invalid_grant') {
      console.log('   → Wrong password. Run: npm run create-admin (with SUPABASE_SERVICE_ROLE_KEY)\n');
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
