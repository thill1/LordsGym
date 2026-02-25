#!/usr/bin/env node
/**
 * Export calendar-related tables from Supabase to JSON files.
 * Run after restoring a paused project. Uses service role so all data (including bookings) is included.
 *
 * Usage: node --env-file=.env.local scripts/export-calendar-backup.mjs
 * Output: scripts/calendar-backup/*.json (create the folder if needed)
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const CALENDAR_TABLES = [
  'instructors',
  'calendar_recurring_patterns',
  'calendar_recurring_exceptions',
  'calendar_events',
  'calendar_bookings',
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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or anon key) in .env.local');
  process.exit(1);
}

const outDir = resolve(process.cwd(), 'scripts', 'calendar-backup');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  console.log('Exporting calendar data from', url, '...\n');

  for (const table of CALENDAR_TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      const count = Array.isArray(data) ? data.length : 0;
      const outPath = resolve(outDir, `${table}.json`);
      writeFileSync(outPath, JSON.stringify(data ?? [], null, 2), 'utf8');
      console.log('  ✅', table, '→', count, 'rows →', outPath);
    } catch (e) {
      console.error('  ❌', table, ':', e.message);
    }
  }

  console.log('\nDone. Backup files are in scripts/calendar-backup/');
}

main();
