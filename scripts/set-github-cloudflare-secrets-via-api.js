#!/usr/bin/env node
/**
 * Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in GitHub repo via REST API.
 * Requires: GITHUB_TOKEN (PAT with repo + Actions secrets), CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 * Loads .env.local from project root if present.
 * Usage: node scripts/set-github-cloudflare-secrets-via-api.js
 *    or: GITHUB_TOKEN=ghp_xxx CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx node scripts/set-github-cloudflare-secrets-via-api.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Load .env.local (script parsing; Node --env-file may also load it on Node 20+)
const envPath = path.join(root, '.env.local');
const parsedKeys = [];
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8');
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1); // strip BOM
  for (const line of content.split(/\r?\n/)) {
    let trimmed = line.trim().replace(/\s+/g, ' '); // normalize spaces
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('export ')) trimmed = trimmed.slice(7).trim();
    const eq = trimmed.indexOf('=');
    const colon = trimmed.indexOf(':');
    const sep = eq >= 0 && (colon < 0 || eq < colon) ? eq : colon >= 0 ? colon : -1;
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    let val = trimmed.slice(sep + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
    parsedKeys.push(key);
  }
}

const OWNER = 'thill1';
const REPO = 'LordsGym';

const token = process.env.GITHUB_TOKEN;
const cfToken = process.env.CLOUDFLARE_API_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const adminAllowlist = process.env.VITE_ADMIN_ALLOWLIST_EMAILS;
const breakGlassEmail = process.env.VITE_BREAK_GLASS_ADMIN_EMAIL;
const oauthRedirectUrl = process.env.VITE_ADMIN_OAUTH_REDIRECT_URL;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Help debug: show what was loaded (not values)
const found = fs.existsSync(envPath);
console.log('.env.local path:', envPath);
console.log('.env.local exists:', found);
console.log('Keys parsed from file:', parsedKeys.length ? parsedKeys.join(', ') : '(none)');
console.log('GITHUB_TOKEN:', token ? 'set' : 'NOT SET');
console.log('CLOUDFLARE_API_TOKEN:', cfToken ? 'set' : 'NOT SET');
console.log('CLOUDFLARE_ACCOUNT_ID:', cfAccountId ? 'set' : 'NOT SET');
console.log('VITE_ADMIN_ALLOWLIST_EMAILS:', adminAllowlist ? 'set' : 'NOT SET (optional)');
console.log('VITE_BREAK_GLASS_ADMIN_EMAIL:', breakGlassEmail ? 'set' : 'NOT SET (optional)');
console.log('VITE_ADMIN_OAUTH_REDIRECT_URL:', oauthRedirectUrl ? 'set' : 'NOT SET (optional)');

if (!token) {
  console.error('\nError: GITHUB_TOKEN is required (PAT with repo + Actions: write secrets).');
  console.error('In .env.local use exactly: GITHUB_TOKEN=ghp_xxxx (no spaces around =, no quotes).');
  process.exit(1);
}
if (!cfToken || !cfAccountId) {
  console.error('\nError: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required.');
  console.error('In .env.local use exactly: CLOUDFLARE_API_TOKEN=xxx and CLOUDFLARE_ACCOUNT_ID=xxx');
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
          'User-Agent': 'LordsGym-SetSecrets-Script',
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
            if (res.statusCode >= 400) {
              reject(new Error(json?.message || `HTTP ${res.statusCode}: ${buf}`));
            } else {
              resolve(json);
            }
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

  const { key_id, key } = await api(
    'GET',
    `/repos/${OWNER}/${REPO}/actions/secrets/public-key`
  );
  const publicKey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);

  function encrypt(secret) {
    const bin = sodium.from_string(secret);
    const enc = sodium.crypto_box_seal(bin, publicKey);
    return sodium.to_base64(enc, sodium.base64_variants.ORIGINAL);
  }

  async function setSecret(name, value) {
    await api('PUT', `/repos/${OWNER}/${REPO}/actions/secrets/${name}`, {
      encrypted_value: encrypt(value),
      key_id,
    });
    console.log(`Set ${name}`);
  }

  await setSecret('CLOUDFLARE_API_TOKEN', cfToken);
  await setSecret('CLOUDFLARE_ACCOUNT_ID', cfAccountId);

  if (adminAllowlist) await setSecret('VITE_ADMIN_ALLOWLIST_EMAILS', adminAllowlist);
  if (breakGlassEmail) await setSecret('VITE_BREAK_GLASS_ADMIN_EMAIL', breakGlassEmail);
  if (oauthRedirectUrl) await setSecret('VITE_ADMIN_OAUTH_REDIRECT_URL', oauthRedirectUrl);
  if (supabaseUrl) await setSecret('VITE_SUPABASE_URL', supabaseUrl);
  if (supabaseAnonKey) await setSecret('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);

  console.log('Done. Re-run the failed workflow or push to trigger deploy.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
