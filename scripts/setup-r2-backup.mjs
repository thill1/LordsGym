#!/usr/bin/env node
/**
 * One-time setup for daily Supabase→R2 backup.
 * 1. Opens Cloudflare R2 dashboard for you to enable R2, create bucket, create API token
 * 2. Prompts you to add R2 credentials to .env.local
 * 3. Pushes R2 secrets to GitHub via set-github-cloudflare-secrets-via-api.js
 *
 * Usage: node scripts/setup-r2-backup.mjs
 * Requires: .env.local with GITHUB_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.local');

// Load .env.local
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const r2Url = accountId
  ? `https://dash.cloudflare.com/${accountId}/r2/overview`
  : 'https://dash.cloudflare.com/?to=/:account/r2/overview';

console.log('\n=== LordsGym R2 Backup Setup ===\n');
console.log('Opening Cloudflare R2 dashboard in your browser...\n');

// Open browser (macOS/Linux)
const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
spawn(openCmd, [r2Url], { stdio: 'ignore', detached: true }).unref();

console.log('In the Cloudflare dashboard:\n');
console.log('1. Enable R2 (if prompted) — R2 has a free tier (10 GB storage).');
console.log('2. Create bucket: Click "Create bucket" → name: lords-gym-backups');
console.log('3. Create API token: R2 → "Manage R2 API Tokens" → Create API token');
console.log('   - Name: github-backup-daily');
console.log('   - Permissions: Object Read and Write');
console.log('   - Scope: lords-gym-backups (or "Apply to specific buckets only")');
console.log('   - Copy Access Key ID and Secret Access Key (secret shown once!)\n');
console.log('4. Add to .env.local:\n');
console.log('   R2_BACKUP_BUCKET=lords-gym-backups');
console.log('   R2_ACCESS_KEY_ID=your_access_key_id');
console.log('   R2_SECRET_ACCESS_KEY=your_secret_access_key\n');
console.log('5. Run this script again to push secrets to GitHub:');
console.log('   node scripts/setup-r2-backup.mjs\n');

const hasR2 = process.env.R2_BACKUP_BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;

if (hasR2) {
  console.log('R2 credentials found in .env.local. Pushing to GitHub...\n');
  const child = spawn('node', ['scripts/set-github-cloudflare-secrets-via-api.js'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env },
  });
  child.on('exit', (code) => {
    if (code === 0) {
      console.log('\n✅ Setup complete. Run "Daily backup (Supabase → R2)" in GitHub Actions to test.');
    }
    process.exit(code ?? 0);
  });
} else {
  console.log('Add R2 credentials to .env.local, then run this script again.\n');
}
