#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) return {};
  const out = {};
  const content = readFileSync(envPath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

function parseArgs(argv) {
  const parsed = {
    emails: [],
    role: 'admin',
    removeRole: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--email' && argv[i + 1]) {
      parsed.emails.push(argv[++i]);
      continue;
    }
    if (arg === '--emails' && argv[i + 1]) {
      parsed.emails.push(...argv[++i].split(',').map((x) => x.trim()).filter(Boolean));
      continue;
    }
    if (arg === '--role' && argv[i + 1]) {
      parsed.role = argv[++i].trim();
      continue;
    }
    if (arg === '--remove-role') {
      parsed.removeRole = true;
      continue;
    }
    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }
  }

  parsed.emails = [...new Set(parsed.emails.map((x) => x.toLowerCase()))];
  return parsed;
}

function usageAndExit() {
  console.error('Usage: node scripts/set-admin-app-metadata.mjs --email admin@example.com [--role admin] [--dry-run]');
  console.error('   or: node scripts/set-admin-app-metadata.mjs --emails a@x.com,b@y.com [--remove-role]');
  process.exit(1);
}

async function listUsers(baseUrl, serviceRoleKey) {
  const users = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${baseUrl}/auth/v1/admin/users?page=${page}&per_page=100`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Failed listing users (page ${page}): ${data.msg || data.message || res.statusText}`);
    }
    const batch = Array.isArray(data.users) ? data.users : [];
    users.push(...batch);
    if (batch.length < 100) break;
  }
  return users;
}

async function updateUser(baseUrl, serviceRoleKey, userId, payload) {
  const res = await fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.msg || data.message || res.statusText);
  }
  return data;
}

async function main() {
  const env = { ...loadEnvFile(), ...process.env };
  const args = parseArgs(process.argv.slice(2));
  if (!args.emails.length) usageAndExit();

  const baseUrl = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!baseUrl || !serviceRoleKey) {
    console.error('Missing VITE_SUPABASE_URL (or SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(`Project: ${baseUrl}`);
  console.log(`Mode: ${args.removeRole ? 'remove role' : `set role=${args.role}`}${args.dryRun ? ' (dry run)' : ''}`);

  const allUsers = await listUsers(baseUrl, serviceRoleKey);
  const targetUsers = allUsers.filter((u) => args.emails.includes((u.email || '').toLowerCase()));

  if (!targetUsers.length) {
    console.error('No matching users found for requested emails.');
    process.exit(1);
  }

  for (const user of targetUsers) {
    const current = user.app_metadata && typeof user.app_metadata === 'object' ? user.app_metadata : {};
    const next = { ...current };

    if (args.removeRole) delete next.role;
    else next.role = args.role;

    const noChange = JSON.stringify(current) === JSON.stringify(next);
    const email = user.email || user.id;

    if (noChange) {
      console.log(`No change needed for ${email}`);
      continue;
    }

    if (args.dryRun) {
      console.log(`Would update ${email}:`, { before: current, after: next });
      continue;
    }

    await updateUser(baseUrl, serviceRoleKey, user.id, { app_metadata: next });
    console.log(`Updated ${email}: role=${next.role || '(removed)'}`);
  }

  const missing = args.emails.filter((email) => !targetUsers.some((u) => (u.email || '').toLowerCase() === email));
  if (missing.length) {
    console.warn(`Emails not found: ${missing.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
