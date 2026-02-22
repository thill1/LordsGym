#!/usr/bin/env node
/**
 * Print Supabase env vars for manual copy into GitHub Secrets.
 * Run: node --env-file=.env.local scripts/show-supabase-secrets-for-github.js
 * Then add these at https://github.com/thill1/LordsGym/settings/secrets/actions
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of content.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq <= 0) continue;
  env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
}

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log('\nAdd these repository secrets at:');
console.log('https://github.com/thill1/LordsGym/settings/secrets/actions\n');
console.log('Name: VITE_SUPABASE_URL');
console.log('Value:', url || '(not set in .env.local)');
console.log('\nName: VITE_SUPABASE_ANON_KEY');
console.log('Value:', key ? `${key.slice(0, 20)}...${key.slice(-10)}` : '(not set)');
if (key) {
  console.log('\nFull anon key (copy this for Value):');
  console.log(key);
}
console.log('\nAfter adding, go to Actions → Deploy to Cloudflare Pages → Re-run all jobs.\n');
