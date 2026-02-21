#!/usr/bin/env node
/**
 * Full database audit — verifies Supabase schema, connectivity, and app-critical paths.
 * Uses anon key (same as client). Run: node --env-file=.env.local scripts/db-audit.mjs
 *
 * Exits 0 when audit passes (or when Supabase not configured).
 * Exits 1 when audit fails.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const EXPECTED_TABLES = [
  'settings',
  'home_content',
  'products',
  'testimonials',
  'pages',
  'media',
  'instructors',
  'calendar_recurring_patterns',
  'calendar_events',
  'calendar_bookings',
  'calendar_recurring_exceptions',
  'activity_logs',
  'page_versions',
  'seo_settings',
  'schema_markup',
  'page_views',
  'memberships',
  'payment_intents',
  'contact_submissions',
];

const ANON_READABLE_TABLES = [
  'settings',
  'home_content',
  'products',
  'testimonials',
  'pages',
  'media',
  'instructors',
  'calendar_recurring_patterns',
  'calendar_events',
  'calendar_recurring_exceptions',
  'schema_markup',
];

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
const anon = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.log('db-audit: Supabase not configured (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). Skipping audit.');
  process.exit(0);
}

const supabase = createClient(url, anon);

let passed = 0;
let failed = 0;

function ok(msg) {
  console.log('  ✅', msg);
  passed++;
}

function fail(msg) {
  console.log('  ❌', msg);
  failed++;
}

async function main() {
  console.log('🔍 LordsGym Database Audit\n');

  // 1. Connectivity & core reads
  console.log('1. Connectivity & core reads');
  try {
    const { data, error } = await supabase.from('settings').select('id, site_name').eq('id', 'default').limit(1).maybeSingle();
    if (error) throw error;
    ok(`Connected; settings row: ${data?.site_name ?? '(default)'}`);
  } catch (e) {
    fail(`Connection failed: ${e.message}`);
  }

  // 2. Anon-readable tables
  console.log('\n2. Anon-readable tables');
  for (const table of ANON_READABLE_TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) throw error;
      ok(`${table}`);
    } catch (e) {
      fail(`${table}: ${e.message}`);
    }
  }

  // 3. Products columns (image_coming_soon from migration)
  console.log('\n3. Products schema');
  try {
    const { data, error } = await supabase.from('products').select('id, title, price, image_coming_soon, coming_soon_image').limit(1);
    if (error) throw error;
    ok('products has id, title, price, image_coming_soon, coming_soon_image');
  } catch (e) {
    fail(`products schema: ${e.message}`);
  }

  console.log('\n3b. Products currently in database');
  try {
    const { data, error } = await supabase.from('products').select('id, title').order('id');
    if (error) throw error;
    const list = Array.isArray(data) ? data : [];
    list.forEach((p) => console.log(`     - ${p.id}: ${p.title}`));
    ok(`products count: ${list.length}`);
  } catch (e) {
    fail(`products list: ${e.message}`);
  }

  // 4. Testimonials source/external_id
  console.log('\n4. Testimonials schema');
  try {
    const { data, error } = await supabase.from('testimonials').select('id, name, source, external_id').limit(1);
    if (error) throw error;
    ok('testimonials has source, external_id');
  } catch (e) {
    fail(`testimonials schema: ${e.message}`);
  }

  // 5. Calendar RPC
  console.log('\n5. Calendar RPC');
  try {
    const { data, error } = await supabase.rpc('get_calendar_events_for_display');
    if (error) throw error;
    const arr = Array.isArray(data) ? data : [];
    ok(`get_calendar_events_for_display: ${arr.length} events`);
  } catch (e) {
    fail(`get_calendar_events_for_display: ${e.message}`);
  }

  // 6. Settings popup_modals
  console.log('\n6. Settings popup_modals');
  try {
    const { data, error } = await supabase.from('settings').select('popup_modals').eq('id', 'default').single();
    if (error) throw error;
    const modals = data?.popup_modals;
    if (Array.isArray(modals) || modals === null) {
      ok('popup_modals column present');
    } else {
      fail('popup_modals not array or null');
    }
  } catch (e) {
    fail(`popup_modals: ${e.message}`);
  }

  // 7. Page views (anon INSERT for analytics)
  console.log('\n7. Page views');
  try {
    const { error } = await supabase.from('page_views').insert({
      path: '/db-audit-test',
      session_id: `audit-${Date.now()}`,
      referrer: null,
      user_agent: 'db-audit.mjs',
    });
    if (error) throw error;
    ok('page_views INSERT (anon)');
  } catch (e) {
    fail(`page_views INSERT: ${e.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\n❌ Audit failed. Apply migrations: npm run db:push');
    console.log('   Or apply pending schema only: npm run db:apply-pending');
    process.exit(1);
  }
  console.log('\n✅ Database audit passed.\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
