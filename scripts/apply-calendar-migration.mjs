#!/usr/bin/env node
/**
 * Apply the calendar recurring fix via Supabase Management API.
 * Fallback when db push has migration history conflicts.
 *
 * Run: node --env-file=.env.local scripts/apply-calendar-migration.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv(resolve(root, '.env.local'));
loadEnv(resolve(root, '.env'));

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = 'mrptukahxloqpdqiaxkb';
const migrationPath = resolve(root, 'supabase/migrations/20260219_calendar_recurring_public.sql');

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in .env.local');
  process.exit(1);
}

const sql = readFileSync(migrationPath, 'utf8');

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/migrations`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: sql,
    name: '20260219_calendar_recurring_public',
  }),
});

if (!res.ok) {
  const text = await res.text();
  console.error('API error:', res.status, text);
  process.exit(1);
}

console.log('Migration applied successfully via Management API');
const data = await res.json().catch(() => ({}));
if (Object.keys(data).length) console.log(data);
