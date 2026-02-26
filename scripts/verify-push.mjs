#!/usr/bin/env node
/**
 * Verify that a push actually reached GitHub and that the deploy workflow was triggered.
 * Run after `git push origin main` to confirm the commit is on remote and a workflow run exists.
 *
 * Usage:
 *   node scripts/verify-push.mjs              # Verify HEAD (after push)
 *   node scripts/verify-push.mjs <commit-sha> # Verify specific commit
 *   node --env-file=.env.local scripts/verify-push.mjs  # With GITHUB_TOKEN for workflow check
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const OWNER = 'thill1';
const REPO = 'LordsGym';
const BRANCH = 'main';

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return {};
  let content = fs.readFileSync(envPath, 'utf8');
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    let t = line.trim();
    if (!t || t.startsWith('#')) continue;
    if (t.startsWith('export ')) t = t.slice(7).trim();
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

function git(cmd) {
  return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
}

function httpsGet(pathname, token) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: pathname,
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'User-Agent': 'LordsGym-Verify-Push',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          if (res.statusCode >= 400) {
            try {
              const j = buf ? JSON.parse(buf) : null;
              reject(new Error(j?.message || `HTTP ${res.statusCode}`));
            } catch {
              reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
            }
          } else {
            try {
              resolve(buf ? JSON.parse(buf) : null);
            } catch {
              resolve(buf);
            }
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const commitSha = process.argv[2] || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const shortSha = commitSha.slice(0, 7);

  console.log('Verify Push\n');
  console.log('Commit: ' + shortSha + ' (' + commitSha + ')\n');

  console.log('1. Checking remote...');
  try {
    execSync('git fetch origin', { encoding: 'utf8' });
  } catch (e) {
    console.error('git fetch failed:', e.message);
    process.exit(1);
  }

  const originMainSha = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();
  if (originMainSha !== commitSha) {
    try {
      execSync('git merge-base --is-ancestor ' + commitSha + ' origin/main', { encoding: 'utf8' });
      console.log('   WARNING: Commit ' + shortSha + ' is an ancestor of origin/main but not the tip.');
      console.log('   origin/main is at ' + originMainSha.slice(0, 7));
    } catch {
      console.error('   FAIL: Commit ' + shortSha + ' is NOT on origin/main.');
      console.error('   origin/main is at ' + originMainSha.slice(0, 7));
      process.exit(1);
    }
  } else {
    console.log('   OK: Commit ' + shortSha + ' is the tip of origin/main');
  }

  const env = loadEnvLocal();
  const token = process.env.GITHUB_TOKEN || env.GITHUB_TOKEN;

  if (!token) {
    console.log('\n2. Skipping workflow check (GITHUB_TOKEN not set)');
    console.log('   Add GITHUB_TOKEN to .env.local for full verification.');
    console.log('\nRemote verification passed.');
    process.exit(0);
  }

  console.log('\n2. Checking GitHub Actions workflow...');
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const data = await httpsGet('/repos/' + OWNER + '/' + REPO + '/actions/runs?branch=' + BRANCH + '&per_page=10', token);
      const runs = data?.workflow_runs || [];
      const runForCommit = runs.find((r) => r.head_sha === commitSha || (r.head_sha && r.head_sha.startsWith(commitSha)));

      if (runForCommit) {
        console.log('   OK: Workflow run found:', runForCommit.name || 'Deploy');
        console.log('   URL:', runForCommit.html_url || 'https://github.com/' + OWNER + '/' + REPO + '/actions');
        console.log('\nVerification passed.');
        process.exit(0);
      }
    } catch (e) {
      console.log('   Attempt ' + attempt + '/6:', e.message);
    }
    if (attempt < 6) {
      console.log('   Waiting 5s...');
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log('   WARNING: No workflow run found after 6 attempts.');
  console.log('   Check: https://github.com/' + OWNER + '/' + REPO + '/actions');
  console.log('\nRemote verification passed (workflow check inconclusive).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
