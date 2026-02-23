#!/usr/bin/env node
/**
 * Wrapper: Run LordsGym complete-supabase-with-service-key.js
 * Provisions media bucket, settings, admin user on the target project.
 *
 * Requires: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (from .env.local or env)
 * Run from: supabase-rebuild-lordsgym/scripts/node
 * Or: node scripts/node/01_complete_supabase.js (from workspace root)
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '../..');
const lordsGymRoot = resolve(workspaceRoot, '../');

const scriptPath = join(lordsGymRoot, 'scripts/complete-supabase-with-service-key.js');
const envPath = join(lordsGymRoot, '.env.local');

if (!existsSync(scriptPath)) {
  console.error('❌ LordsGym script not found:', scriptPath);
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.error('❌ .env.local not found at LordsGym root. Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

console.log('Running complete-supabase-with-service-key.js (from LordsGym)...');
const child = spawn('node', ['--env-file=.env.local', scriptPath], {
  cwd: lordsGymRoot,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
