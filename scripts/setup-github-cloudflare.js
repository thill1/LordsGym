#!/usr/bin/env node
/**
 * GitHub → Cloudflare Pages Setup & Test
 * Configures and verifies deployment from GitHub to Cloudflare.
 * Run: node scripts/setup-github-cloudflare.js
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WORKFLOW_PATH = path.join(ROOT, '.github/workflows/deploy-cloudflare.yml');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(msg, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, CYAN);
  console.log('='.repeat(60));
}

function check(name, ok, detail = '') {
  const icon = ok ? '✅' : '❌';
  const c = ok ? GREEN : RED;
  log(`  ${icon} ${name}${detail ? ': ' + detail : ''}`, c);
  return ok;
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', ...opts });
  } catch (e) {
    return null;
  }
}

section('1. Prerequisites');
let allOk = true;

allOk = check('Workflow file exists', fs.existsSync(WORKFLOW_PATH)) && allOk;
allOk = check('Node.js', !!run('node -v')) && allOk;
allOk = check('npm', !!run('npm -v')) && allOk;
allOk = check('package.json exists', fs.existsSync(path.join(ROOT, 'package.json'))) && allOk;

section('2. Test Build');
const buildEnv = {
  ...process.env,
  VITE_BASE_PATH: '/',
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
};

const buildResult = spawnSync('npm', ['run', 'build'], {
  cwd: ROOT,
  env: buildEnv,
  stdio: 'pipe'
});

if (buildResult.status === 0) {
  check('Build succeeded', true);
  const distPath = path.join(ROOT, 'dist');
  const indexExists = fs.existsSync(path.join(distPath, 'index.html'));
  check('dist/index.html generated', indexExists);
} else {
  check('Build failed', false);
  console.log(buildResult.stderr?.toString() || buildResult.stdout?.toString());
  allOk = false;
}

section('3. GitHub Secrets (& Cloudflare)');
log('Add these in your repo: Settings → Secrets and variables → Actions', YELLOW);
log('');
log('  CLOUDFLARE_API_TOKEN   - From Cloudflare: My Profile → API Tokens', YELLOW);
log('  CLOUDFLARE_ACCOUNT_ID - From Cloudflare dashboard sidebar', YELLOW);
log('  VITE_SUPABASE_URL     - Your Supabase project URL', YELLOW);
log('  VITE_SUPABASE_ANON_KEY - Supabase anon key', YELLOW);
log('');
log('Cloudflare token: Use template "Edit Cloudflare Workers" or custom "Pages:Edit"', YELLOW);

section('4. Local Deploy Test (optional)');
if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID) {
  log('Env vars set. Running: npx wrangler pages deploy dist --project-name=lords-gym', YELLOW);
  const deployResult = spawnSync('npx', ['wrangler', 'pages', 'deploy', 'dist', '--project-name=lords-gym'], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  if (deployResult.status === 0) {
    check('Deploy succeeded', true);
  } else {
    check('Deploy failed', false);
  }
} else {
  log('Skip: Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to test deploy locally', YELLOW);
}

section('5. Summary');
if (allOk) {
  log('Setup ready. Push to main to trigger deploy, or run workflow manually.', GREEN);
  log('Actions → Deploy to Cloudflare Pages → Run workflow', GREEN);
} else {
  log('Fix the issues above before deploying.', RED);
}
console.log('');
