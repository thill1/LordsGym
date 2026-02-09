#!/usr/bin/env node
/**
 * Test admin login against Supabase Auth API directly.
 * Verifies the password works and shows the exact error if not.
 */

const SUPABASE_URL = 'https://mrptukahxloqpdqiaxkb.supabase.co';
const ADMIN_EMAIL = 'lordsgymoutreach@gmail.com';
const PASSWORD = process.argv[2] || 'Az$b9SKkvNL8D4mF';

// Anon key is public - used by the client for signIn
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function testLogin() {
  console.log('Testing admin login...\n');
  console.log('  Supabase URL:', SUPABASE_URL);
  console.log('  Email:', ADMIN_EMAIL);
  console.log('  Password:', PASSWORD ? '***' : '(not provided)');
  console.log('  Anon key:', ANON_KEY ? 'set' : 'MISSING\n');

  if (!ANON_KEY) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is required.');
    console.error('   Get from: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api');
    console.error('   Run: VITE_SUPABASE_ANON_KEY=your_anon_key node scripts/test-admin-login.js [password]\n');
    process.exit(1);
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: PASSWORD,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    console.log('✅ Login successful!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'yes' : 'no');
    console.log('   needs_password_change:', data.user?.user_metadata?.needs_password_change);
    console.log('\n   The password works. If the site still fails, check:');
    console.log('   1. Production build has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY baked in');
    console.log('   2. Supabase Auth → URL Configuration has Site URL and Redirect URLs set');
    console.log('   3. Use https://lordsgymoutreach.com/#/admin (hash routing)\n');
  } else {
    console.error('❌ Login failed:', data.error_description || data.msg || data.message || res.statusText);
    console.error('   Error:', data.error);
    console.error('   Full response:', JSON.stringify(data, null, 2));
    if (data.error === 'invalid_grant') {
      console.error('\n   "invalid_grant" usually means wrong email or password.');
      console.error('   Run: npm run create-admin (with SUPABASE_SERVICE_ROLE_KEY) to reset password.\n');
    }
    process.exit(1);
  }
}

testLogin().catch((e) => {
  console.error(e);
  process.exit(1);
});
