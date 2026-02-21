#!/usr/bin/env node
/**
 * Apply image_coming_soon migration via Supabase CLI / direct Postgres.
 * Use when db:push fails due to migration history conflicts.
 *
 * Requires one of:
 * - SUPABASE_DB_URL (full postgres connection string), or
 * - SUPABASE_DB_PASSWORD (with VITE_SUPABASE_URL for project ref)
 *
 * Run: npm run db:apply-image-coming-soon
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

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

const sql = readFileSync(
  resolve(root, 'supabase/migrations/20260220_products_image_coming_soon.sql'),
  'utf8'
);

let connStr = process.env.SUPABASE_DB_URL;
if (!connStr && process.env.SUPABASE_DB_PASSWORD) {
  const url = process.env.VITE_SUPABASE_URL || 'https://mrptukahxloqpdqiaxkb.supabase.co';
  const ref = url.replace(/^https?:\/\//, '').split('.')[0];
  const pw = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
  connStr = `postgresql://postgres:${pw}@db.${ref}.supabase.co:5432/postgres`;
}

if (!connStr) {
  console.error('Add to .env.local:');
  console.error('  SUPABASE_DB_PASSWORD=your_db_password');
  console.error('Or: SUPABASE_DB_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres');
  console.error('');
  console.error('Get the password from: Supabase Dashboard > Project Settings > Database');
  process.exit(1);
}

const client = new pg.Client({ connectionString: connStr });
try {
  await client.connect();
  await client.query(sql);
  console.log('Migration 20260220_products_image_coming_soon applied successfully');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
