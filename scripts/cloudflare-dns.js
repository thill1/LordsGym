#!/usr/bin/env node
/**
 * Cloudflare DNS - Add/update DNS records via API
 * No browser needed. Uses CLOUDFLARE_API_TOKEN (needs Zone:DNS:Edit or DNS Write).
 *
 * Usage:
 *   node scripts/cloudflare-dns.js <domain> <type> <name> <content> [proxied]
 *   node scripts/cloudflare-dns.js lordsgym.com CNAME @ lords-gym.pages.dev true
 *   node scripts/cloudflare-dns.js lordsgym.com CNAME www lords-gym.pages.dev true
 *
 * Or set CLOUDFLARE_ZONE_ID to skip zone lookup:
 *   CLOUDFLARE_ZONE_ID=xxx node scripts/cloudflare-dns.js CNAME @ lords-gym.pages.dev true
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API = 'https://api.cloudflare.com/client/v4';

function loadEnv() {
  const paths = [join(__dirname, '..', '.env.local'), join(__dirname, '..', '.env')];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, 'utf8');
    const env = {};
    raw.split('\n').forEach((line) => {
      const [k, ...v] = line.replace(/^#.*/, '').split('=');
      if (k?.trim()) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    });
    return env;
  }
  return {};
}

const env = { ...loadEnv(), ...process.env };
const token = env.CLOUDFLARE_API_TOKEN;
const zoneId = env.CLOUDFLARE_ZONE_ID;

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
    ...opts,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || JSON.stringify(data.errors));
  return data;
}

async function getZone(domainOrId) {
  const byId = /^[a-f0-9]{32}$/i.test(domainOrId);
  const { result } = await api(byId ? `/zones/${domainOrId}` : `/zones?name=${domainOrId}`);
  const zone = Array.isArray(result) ? result[0] : result;
  if (!zone) throw new Error(`Zone not found: ${domainOrId}`);
  return zone;
}

async function listRecords(zoneId) {
  const { result } = await api(`/zones/${zoneId}/dns_records`);
  return result;
}

async function createRecord(zoneId, { type, name, content, ttl = 1, proxied = true }) {
  const { result } = await api(`/zones/${zoneId}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({ type, name, content, ttl, proxied }),
  });
  return result;
}

async function main() {
  if (!token) {
    console.error('❌ CLOUDFLARE_API_TOKEN required. Add to .env.local or export.');
    console.error('   Get token: https://dash.cloudflare.com/profile/api-tokens');
    console.error('   Needed: Zone → DNS → Edit');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let domain, type, name, content, proxied;

  if (zoneId && args.length >= 4) {
    [type, name, content, proxied] = args;
  } else if (args.length >= 5) {
    [domain, type, name, content, proxied] = args;
  } else {
    console.log('Usage:');
    console.log('  node scripts/cloudflare-dns.js <domain> <type> <name> <content> [proxied]');
    console.log('');
    console.log('Example - Point lordsgym.com to Cloudflare Pages:');
    console.log('  node scripts/cloudflare-dns.js lordsgym.com CNAME @ lords-gym.pages.dev true');
    console.log('  node scripts/cloudflare-dns.js lordsgym.com CNAME www lords-gym.pages.dev true');
    console.log('');
    console.log('Or set CLOUDFLARE_ZONE_ID and run:');
    console.log('  node scripts/cloudflare-dns.js CNAME @ lords-gym.pages.dev true');
    process.exit(1);
  }

  let resolvedZoneId, zoneName;
  if (zoneId) {
    const zone = await getZone(zoneId);
    resolvedZoneId = zone.id;
    zoneName = zone.name;
  } else {
    const zone = await getZone(domain);
    resolvedZoneId = zone.id;
    zoneName = zone.name;
  }
  const proxiedBool = proxied === 'true' || proxied === '1';

  const recordName = domain || zoneName
    ? (name === '@' ? (zoneName || domain) : `${name}.${zoneName || domain}`)
    : name;
  const existing = await listRecords(resolvedZoneId);
  const match = existing.find((r) => r.type === type && r.name === recordName);

  if (match) {
    console.log('Record exists:', match.name, match.type, '->', match.content);
    console.log('Use Cloudflare dashboard to update, or add update logic to this script.');
    return;
  }
  const record = await createRecord(resolvedZoneId, {
    type,
    name: recordName,
    content,
    proxied: proxiedBool,
  });
  console.log('✅ Created:', record.name, record.type, '->', record.content);
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
