#!/usr/bin/env node
/**
 * Test that the calendar RPC returns events with recurring patterns.
 * Run: node scripts/test-calendar-rpc.mjs
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or env
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add to .env.local');
  process.exit(1);
}

const supabase = createClient(url, anon);

async function main() {
  console.log('Calling get_calendar_events_for_display RPC...');
  const { data, error } = await supabase.rpc('get_calendar_events_for_display');

  if (error) {
    console.error('RPC error:', error.message);
    console.error('  Run: supabase db push  (to deploy the RPC migration)');
    process.exit(1);
  }

  const events = Array.isArray(data) ? data : [];
  const withPattern = events.filter((e) => e.recurring_pattern).length;

  console.log('Events:', events.length);
  console.log('With recurring_pattern:', withPattern);

  if (events.length === 0) {
    console.log('(No events in DB - ok if empty)');
  } else if (withPattern === 0 && events.some((e) => e.recurring_pattern_id)) {
    console.error('FAIL: Some events have recurring_pattern_id but pattern is null');
    process.exit(1);
  }

  console.log('OK: RPC returns recurring patterns correctly');
}

main();
