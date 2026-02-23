#!/usr/bin/env node
/**
 * Supabase diagnostics via Management API and direct connectivity tests.
 * Run: node --env-file=.env.local scripts/supabase-diagnose.mjs [options]
 *
 * --restore: If project is paused, attempt to restore (unpause) it.
 * --try-recovery: When stuck in PAUSING, attempt recovery actions (restart DB, restore/cancel, restore).
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PROJECT_REF = 'mrptukahxloqpdqiaxkb';
const BASE_URL = `https://mrptukahxloqpdqiaxkb.supabase.co`;

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.VITE_SUPABASE_URL || BASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const RESTORE = process.argv.includes('--restore');
const RESTART = process.argv.includes('--restart');
const TRY_RECOVERY = process.argv.includes('--try-recovery');

async function api(method, path, body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}${path}`, opts);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data, text };
}

async function main() {
  console.log('🔍 Supabase Diagnostics — Lords Gym\n');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`URL: ${url}\n`);

  if (!token) {
    console.error('❌ SUPABASE_ACCESS_TOKEN required in .env.local');
    console.error('   Get from: https://supabase.com/dashboard/account/tokens\n');
    process.exit(1);
  }

  // 1. Get project status via Management API
  console.log('1. Management API — Project Status');
  const projRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const proj = projRes.ok ? await projRes.json() : null;
  if (proj) {
    const status = proj.status || proj.restored_at ? 'RESTORING' : 'UNKNOWN';
    console.log(`   Status: ${proj.status || 'N/A'} (${status})`);
    if (proj.region) console.log(`   Region: ${proj.region}`);
    if (proj.organization_id) console.log(`   Org: ${proj.organization_id}`);

    if (proj.status === 'INACTIVE' || proj.status === 'PAUSED' || proj.status === 'PAUSING') {
      console.log(`\n   ⚠️  Project is ${proj.status}.`);
      if (proj.status === 'PAUSING') {
        if (TRY_RECOVERY) {
          console.log('\n   🔧 Trying recovery actions (--try-recovery)...\n');
          // 1. Try Postgres config with restart_database (API allows this; may help if DB layer is reachable)
          console.log('   a) PUT /config/database/postgres { restart_database: true }');
          const cfgRes = await api('PUT', '/config/database/postgres', { restart_database: true });
          if (cfgRes.ok) {
            console.log('      ✅ Accepted. DB restart requested. Wait 2–5 min, then re-run diagnostics.\n');
          } else {
            console.log(`      ❌ ${cfgRes.status} ${cfgRes.text?.slice(0, 150) || ''}\n`);
          }
          // 2. Try restore/cancel (cancel in-progress operation; may apply to stuck state)
          console.log('   b) POST /restore/cancel');
          const cancelRes = await api('POST', '/restore/cancel');
          if (cancelRes.ok) {
            console.log('      ✅ Cancel accepted. Re-run diagnostics in 1–2 min.\n');
          } else {
            console.log(`      ❌ ${cancelRes.status} ${cancelRes.text?.slice(0, 150) || '(no body)'}\n`);
          }
          // 3. Retry restore (state may have changed)
          console.log('   c) POST /restore');
          const restoreRes = await api('POST', '/restore');
          if (restoreRes.ok) {
            console.log('      ✅ Restore initiated. Wait 2–5 min for DB to come back.\n');
          } else {
            console.log(`      ❌ ${restoreRes.status} ${restoreRes.text?.slice(0, 150) || ''}\n`);
          }
          console.log('   If none worked: create a new Supabase project and apply migrations. See docs/SUPABASE_PAUSING_RECOVERY.md');
        } else {
          console.log('   Wait 2–5 minutes for pause to complete, then run with --restore.');
          console.log('   If stuck: run with --try-recovery to attempt API-based recovery.');
        }
      } else if (RESTORE) {
        console.log('   Attempting restore (unpause)...');
        const restoreRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/restore`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (restoreRes.ok) {
          console.log('   ✅ Restore initiated. Wait 2–5 minutes for DB to come back.\n');
        } else {
          const err = await restoreRes.text();
          console.log(`   ❌ Restore failed: ${restoreRes.status} ${err}\n`);
        }
      } else {
        console.log('   Run with --restore to unpause: node --env-file=.env.local scripts/supabase-diagnose.mjs --restore\n');
      }
    } else if (RESTART) {
      console.log('\n   🔄 Restart cycle: Pause → Restore (will cause ~2–5 min downtime)');
      const pauseRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/pause`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!pauseRes.ok) {
        console.log(`   ❌ Pause failed: ${pauseRes.status} ${await pauseRes.text()}`);
        console.log('   (Pro projects cannot be paused via API)\n');
      } else {
        console.log('   Pause initiated. Waiting 90s for project to pause...');
        await new Promise((r) => setTimeout(r, 90000));
        console.log('   Restoring (unpause)...');
        const restoreRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/restore`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (restoreRes.ok) {
          console.log('   ✅ Restore initiated. Wait 2–5 minutes for DB to come back.\n');
        } else {
          console.log(`   ❌ Restore failed: ${restoreRes.status} ${await restoreRes.text()}\n`);
        }
      }
    } else {
      console.log('   ✅ Project appears active.');
      if (RESTORE) {
        console.log('   (Already active; --restore has no effect.)');
      }
    }
  } else {
    console.log(`   ❌ Failed to fetch project: ${projRes.status}`);
    const errText = await projRes.text();
    if (errText) console.log(`   ${errText.slice(0, 200)}`);
  }

  // 2. Auth health (no DB)
  console.log('\n2. Auth Health (gateway, no DB)');
  try {
    const healthRes = await fetch(`${url}/auth/v1/health`, { signal: AbortSignal.timeout(10000) });
    console.log(`   /auth/v1/health: ${healthRes.status} (${healthRes.status === 401 ? 'expected—no key' : healthRes.statusText})`);
  } catch (e) {
    console.log(`   ❌ Timeout/error: ${e.message}`);
  }

  // 3. REST/PostgREST (touches DB)
  console.log('\n3. REST API (DB-dependent)');
  if (anonKey) {
    try {
      const restRes = await fetch(`${url}/rest/v1/settings?limit=1`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (restRes.ok) {
        const data = await restRes.json();
        console.log(`   /rest/v1/settings: OK (${Array.isArray(data) ? data.length : 0} rows)`);
      } else {
        console.log(`   /rest/v1/settings: ${restRes.status}`);
      }
    } catch (e) {
      console.log(`   ❌ Timeout/error: ${e.message}`);
      console.log('   → DB/connection pooler path may be unreachable from this network.');
    }
  } else {
    console.log('   Skipped (no VITE_SUPABASE_ANON_KEY)');
  }

  // 4. Auth token (login path — touches DB)
  console.log('\n4. Auth Token (login path, DB-dependent)');
  if (anonKey) {
    try {
      const tokenRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await tokenRes.json();
      if (data.error === 'invalid_grant' || data.error_description?.includes('Invalid')) {
        console.log('   /auth/v1/token: Reached auth service (invalid creds expected)');
      } else if (tokenRes.ok) {
        console.log('   /auth/v1/token: OK');
      } else {
        console.log(`   /auth/v1/token: ${tokenRes.status} — ${data.error_description || data.msg || 'unknown'}`);
      }
    } catch (e) {
      console.log(`   ❌ Timeout/error: ${e.message}`);
      console.log('   → Auth DB path likely unreachable.');
    }
  }

  // 5. Quick products fetch (10s timeout)
  console.log('\n5. Quick DB Test (products, 10s timeout)');
  if (anonKey) {
    try {
      const r = await fetch(`${url}/rest/v1/products?limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(10000),
      });
      console.log(`   /rest/v1/products: ${r.ok ? 'OK' : r.status}`);
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
    }
  }

  console.log('\n---');
  console.log('If project is active but REST/Auth time out: network/routing or Supabase pooler issue.');
  console.log('Try: different network (mobile hotspot), VPN, or contact Supabase support.');
  console.log('Project ref for support: ' + PROJECT_REF);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
