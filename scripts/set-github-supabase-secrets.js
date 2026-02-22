#!/usr/bin/env node
/**
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in GitHub repo secrets.
 * Requires: GITHUB_TOKEN (PAT with repo + Actions: write secrets)
 * Loads .env.local. Usage: node --env-file=.env.local scripts/set-github-supabase-secrets.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}

const OWNER = 'thill1';
const REPO = 'LordsGym';
const token = process.env.GITHUB_TOKEN;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!token) {
  console.error('GITHUB_TOKEN required (PAT with repo + Actions write scope).');
  process.exit(1);
}
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY required in .env.local');
  process.exit(1);
}

async function api(method, pathname, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: pathname,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'LordsGym-SetSupabaseSecrets',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try {
            const json = buf ? JSON.parse(buf) : null;
            if (res.statusCode >= 400) reject(new Error(json?.message || `HTTP ${res.statusCode}`));
            else resolve(json);
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const sodium = require('libsodium-wrappers');
  await sodium.ready;
  const { key_id, key } = await api('GET', `/repos/${OWNER}/${REPO}/actions/secrets/public-key`);
  const publicKey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);

  async function setSecret(name, value) {
    const bin = sodium.from_string(value);
    const enc = sodium.crypto_box_seal(bin, publicKey);
    await api('PUT', `/repos/${OWNER}/${REPO}/actions/secrets/${name}`, {
      encrypted_value: sodium.to_base64(enc, sodium.base64_variants.ORIGINAL),
      key_id,
    });
    console.log('Set', name);
  }

  await setSecret('VITE_SUPABASE_URL', supabaseUrl);
  await setSecret('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);
  console.log('Done. Push to main or re-run workflow to deploy.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
