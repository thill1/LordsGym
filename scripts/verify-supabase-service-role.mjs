#!/usr/bin/env node
/**
 * CI preflight: confirm SUPABASE_SERVICE_ROLE_KEY works for REST (not anon key).
 * Usage: node --env-file=.env.local scripts/verify-supabase-service-role.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
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

loadEnvLocal();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (serviceKey === process.env.VITE_SUPABASE_ANON_KEY) {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY matches VITE_SUPABASE_ANON_KEY — use the service_role key from Supabase → Settings → API'
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const { error } = await supabase.from('instructors').select('id').limit(1);
if (error) {
  console.error(`Supabase service role check failed: ${error.message}`);
  process.exit(1);
}

console.log('Supabase service role key OK (instructors probe succeeded).');