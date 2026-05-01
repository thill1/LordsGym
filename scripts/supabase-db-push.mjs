#!/usr/bin/env node
/**
 * Run supabase db push via CLI. Uses either:
 * - SUPABASE_DB_PASSWORD + VITE_SUPABASE_URL → builds --db-url and runs push (no Management API token needed)
 * - SUPABASE_ACCESS_TOKEN (format sbp_...) → uses linked project (requires token from dashboard)
 *
 * Add to .env.local one of:
 *   SUPABASE_DB_PASSWORD=your_project_db_password
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx  (from https://supabase.com/dashboard/account/tokens)
 *
 * Run: npm run db:push
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
// Fallback: account token from backup env so CLI works without editing .env.local
if (!process.env.SUPABASE_ACCESS_TOKEN) {
  const backupPath = resolve(root, 'supabase-rebuild-lordsgym', 'exports', '.env.local.20260223-041027.backup');
  if (existsSync(backupPath)) loadEnv(backupPath);
}

const url = process.env.VITE_SUPABASE_URL || '';
const projectRef = url.replace(/^https?:\/\//, '').split('.')[0];
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

// Prefer direct DB URL so we don't depend on Management API token format
let args = ['supabase', 'db', 'push', '--yes'];
let env = { ...process.env };

if (dbPassword && projectRef) {
  const encoded = encodeURIComponent(dbPassword);
  const dbUrl = `postgresql://postgres.${projectRef}:${encoded}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
  args = ['supabase', 'db', 'push', '--db-url', dbUrl, '--yes'];
} else if (accessToken && accessToken.startsWith('sbp_')) {
  env.SUPABASE_ACCESS_TOKEN = accessToken;
} else {
  console.error('Add to .env.local one of:');
  console.error('  SUPABASE_DB_PASSWORD=your_backup_project_db_password');
  console.error('  SUPABASE_ACCESS_TOKEN=sbp_xxx  (from https://supabase.com/dashboard/account/tokens)');
  process.exit(1);
}

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env,
});

child.on('exit', (code) => process.exit(code ?? 0));
