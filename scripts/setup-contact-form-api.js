#!/usr/bin/env node

/**
 * Contact Form Setup via Supabase Management API
 *
 * Uses the Supabase Management API to:
 * 1. Run the contact_submissions migration (create table + RLS)
 * 2. Set RESEND_API_KEY secret for Edge Function
 *
 * Requires:
 *   - SUPABASE_ACCESS_TOKEN (Personal Access Token from https://supabase.com/dashboard/account/tokens)
 *   - RESEND_API_KEY (your Resend API key from resend.com)
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node scripts/setup-contact-form-api.js
 *   # or
 *   export SUPABASE_ACCESS_TOKEN=sbp_xxx
 *   export RESEND_API_KEY=re_xxx
 *   node scripts/setup-contact-form-api.js
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_REF = 'mrptukahxloqpdqiaxkb';
const API_BASE = 'https://api.supabase.com/v1';

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

const env = { ...process.env, ...loadEnv() };
const accessToken = env.SUPABASE_ACCESS_TOKEN;
const resendKey = env.RESEND_API_KEY;

async function api(method, path, body = null) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function runMigration() {
  console.log('📦 Running contact_submissions migration...');
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250209_contact_submissions.sql');
  if (!existsSync(migrationPath)) {
    console.error('   ❌ Migration file not found:', migrationPath);
    return false;
  }
  const sql = readFileSync(migrationPath, 'utf-8');
  const { ok, status, data } = await api('POST', `/projects/${PROJECT_REF}/database/query`, { query: sql });
  if (ok) {
    console.log('   ✅ Migration applied successfully\n');
    return true;
  }
  if (status === 404 || (data?.message && data.message.includes('not found'))) {
    console.log('   ⚠️  database/query endpoint may not support DDL. Run migration manually:');
    console.log('      https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
    console.log('      Paste contents of supabase/migrations/20250209_contact_submissions.sql\n');
    return false;
  }
  console.error('   ❌ Migration failed:', status, JSON.stringify(data, null, 2));
  return false;
}

async function setResendSecret() {
  if (!resendKey) {
    console.log('⚠️  RESEND_API_KEY not set. Skipping secret. Set it later via:');
    console.log('   Supabase Dashboard → Edge Functions → Secrets');
    console.log('   or: npx supabase secrets set RESEND_API_KEY=re_xxx --project-ref ' + PROJECT_REF + '\n');
    return false;
  }
  console.log('🔐 Setting RESEND_API_KEY secret...');
  const { ok, status, data } = await api('POST', `/projects/${PROJECT_REF}/secrets`, {
    secrets: [{ name: 'RESEND_API_KEY', value: resendKey }],
  });
  if (ok) {
    console.log('   ✅ Secret set successfully\n');
    return true;
  }
  if (status === 404 || (data?.message && (data.message.includes('not found') || data.message.includes('bulk')))) {
    const alt = await api('POST', `/projects/${PROJECT_REF}/secrets`, {
      name: 'RESEND_API_KEY',
      value: resendKey,
    });
    if (alt.ok) {
      console.log('   ✅ Secret set successfully\n');
      return true;
    }
  }
  console.error('   ❌ Failed to set secret:', status, JSON.stringify(data, null, 2));
  return false;
}

async function main() {
  console.log('🚀 Contact Form Setup via Supabase Management API\n');
  console.log('   Project:', PROJECT_REF);

  if (!accessToken) {
    console.error('\n❌ SUPABASE_ACCESS_TOKEN is required.');
    console.error('   1. Go to: https://supabase.com/dashboard/account/tokens');
    console.error('   2. Create a Personal Access Token');
    console.error('   3. Run: export SUPABASE_ACCESS_TOKEN=sbp_xxx\n');
    process.exit(1);
  }

  const migOk = await runMigration();
  const secretOk = await setResendSecret();

  console.log('---');
  console.log(migOk ? '✅ Migration: applied' : '⚠️  Migration: run manually (see above)');
  console.log(resendKey ? (secretOk ? '✅ RESEND_API_KEY: set' : '❌ RESEND_API_KEY: failed') : '⚠️  RESEND_API_KEY: skipped (provide via env)');
  console.log('\n📋 Deploy Edge Function (requires Supabase CLI):');
  console.log('   npx supabase login');
  console.log('   npx supabase functions deploy contact-form --project-ref ' + PROJECT_REF);
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
