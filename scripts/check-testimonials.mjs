#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
let env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.trim().match(/^([^=]+)=(.*)$/);
    if (m && !line.trim().startsWith('#')) env[m[1].trim()] = m[2].trim();
  });
}

const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.log('Supabase not configured (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(url, key);

const { data, error, count } = await supabase
  .from('testimonials')
  .select('id, name, role, quote, created_at', { count: 'exact' })
  .order('created_at', { ascending: false });

if (error) {
  console.log('Error:', error.message);
  process.exit(1);
}

console.log('=== Supabase Testimonials ===');
console.log('Total records:', count ?? data?.length ?? 0);
console.log('');
if (data?.length) {
  console.log('Records:');
  data.forEach((t, i) => {
    const q = (t.quote || '').slice(0, 60) + ((t.quote || '').length > 60 ? '...' : '');
    console.log(`  ${i + 1}. id=${t.id} | ${t.name} | ${t.role || '-'} | "${q}"`);
  });
} else {
  console.log('(No testimonials in database)');
}
