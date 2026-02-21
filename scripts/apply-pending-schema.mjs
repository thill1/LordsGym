#!/usr/bin/env node
/**
 * Apply pending schema changes (products.image_coming_soon, testimonials.source/external_id)
 * when db:push fails due to migration history conflicts.
 *
 * Uses Supabase Management API (POST /database/query) with SUPABASE_ACCESS_TOKEN.
 * Fallback: SUPABASE_DB_URL or (SUPABASE_DB_PASSWORD + VITE_SUPABASE_URL) for direct pg.
 *
 * Run: npm run db:apply-pending
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

const url = process.env.VITE_SUPABASE_URL || '';
const projectRef = url.replace(/^https?:\/\//, '').split('.')[0];
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

const SQL_STATEMENTS = [
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_coming_soon BOOLEAN DEFAULT false`,
  `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'`,
  `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS external_id TEXT`,
];

async function applyViaManagementApi() {
  if (!accessToken || !projectRef) return false;
  const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  for (const query of SQL_STATEMENTS) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Management API: ${res.status} ${txt}`);
    }
  }
  return true;
}

async function applyViaPg() {
  const connStr = process.env.SUPABASE_DB_URL;
  if (connStr) {
    const pg = await import('pg');
    const client = new pg.default.Client({ connectionString: connStr });
    await client.connect();
    try {
      for (const stmt of SQL_STATEMENTS) await client.query(stmt);
      return true;
    } finally {
      await client.end();
    }
  }
  if (process.env.SUPABASE_DB_PASSWORD) {
    const pg = await import('pg');
    const pw = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
    const connStr = `postgresql://postgres:${pw}@db.${projectRef}.supabase.co:5432/postgres`;
    const client = new pg.default.Client({ connectionString: connStr });
    await client.connect();
    try {
      for (const stmt of SQL_STATEMENTS) await client.query(stmt);
      return true;
    } finally {
      await client.end();
    }
  }
  return false;
}

async function main() {
  try {
    const ok = await applyViaManagementApi() || await applyViaPg();
    if (ok) {
      console.log('Pending schema changes applied: products.image_coming_soon, testimonials.source, testimonials.external_id');
    } else {
      console.error('Add to .env.local: SUPABASE_ACCESS_TOKEN (from dashboard) or SUPABASE_DB_PASSWORD');
      process.exit(1);
    }
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

main();
