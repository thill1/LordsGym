#!/usr/bin/env node
/**
 * Run supabase db push with SUPABASE_ACCESS_TOKEN from .env.local.
 * This lets the AI agent run migrations when the token is in .env.local.
 *
 * Setup:
 * 1. Go to https://supabase.com/dashboard/account/tokens
 * 2. Create a token (or use existing)
 * 3. Add to .env.local: SUPABASE_ACCESS_TOKEN=your_token_here
 *
 * Run: node scripts/supabase-db-push.mjs
 * Or:  npm run db:push
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const root = resolve(__dirname, '..');
loadEnv(resolve(root, '.env.local'));
loadEnv(resolve(root, '.env'));

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN. Add to .env.local:');
  console.error('  1. Go to https://supabase.com/dashboard/account/tokens');
  console.error('  2. Create a token');
  console.error('  3. Add: SUPABASE_ACCESS_TOKEN=your_token');
  process.exit(1);
}

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['supabase', 'db', 'push', '--yes'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN }
});

child.on('exit', (code) => process.exit(code ?? 0));
