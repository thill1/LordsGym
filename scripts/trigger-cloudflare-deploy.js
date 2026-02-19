#!/usr/bin/env node
/**
 * Trigger "Deploy to Cloudflare Pages" workflow via GitHub API.
 * Loads .env.local for GITHUB_TOKEN. Run after set:cloudflare-secrets.
 * Usage: node --env-file=.env.local scripts/trigger-cloudflare-deploy.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8');
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  for (const line of content.split(/\r?\n/)) {
    let t = line.trim();
    if (!t || t.startsWith('#')) continue;
    if (t.startsWith('export ')) t = t.slice(7).trim();
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    process.env[key] = val;
  }
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN required in .env.local');
  process.exit(1);
}

const WORKFLOW_ID = '231710693'; // cloudflare-pages.yml

function api(method, pathname, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: pathname,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'LordsGym-Trigger-Deploy',
          'Content-Type': 'application/json',
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
            resolve(null);
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

api('POST', `/repos/thill1/LordsGym/actions/workflows/${WORKFLOW_ID}/dispatches`, { ref: 'main' })
  .then(() => {
    console.log('Triggered Deploy to Cloudflare Pages. Check https://github.com/thill1/LordsGym/actions');
  })
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
  });
