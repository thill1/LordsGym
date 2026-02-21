#!/usr/bin/env node
/**
 * Remove Faith Over Fear Tee (w1) and Scripture Wristbands (a1) from Supabase products.
 * Run with service role for guaranteed delete: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/remove-deleted-products.mjs
 * Or with anon key (requires authenticated session - use from browser or with JWT).
 *
 * Usage: node --env-file=.env.local scripts/remove-deleted-products.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const TARGET_IDS = ['w1', 'a1']; // Faith Over Fear Tee, Scripture Wristbands

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url) {
  console.error('Missing VITE_SUPABASE_URL');
  process.exit(1);
}

// Prefer service role (bypasses RLS)
const key = serviceKey || anonKey;
if (!key) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log('Removing products w1 (Faith Over Fear Tee) and a1 (Scripture Wristbands)...\n');

  for (const id of TARGET_IDS) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('id, title');

    if (error) {
      console.error(`  ❌ Failed to delete ${id}:`, error.message);
      if (error.code === '42501' || error.message?.includes('policy')) {
        console.log('  → Use SUPABASE_SERVICE_ROLE_KEY to bypass RLS.');
      }
      continue;
    }

    const deleted = Array.isArray(data) ? data : [];
    if (deleted.length > 0) {
      console.log(`  ✅ Deleted: ${id} (${deleted[0]?.title || id})`);
    } else {
      console.log(`  ⚠️  ${id} not found (already removed or never existed)`);
    }
  }

  console.log('\nDone. Run db-audit to verify products list.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
