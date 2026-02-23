#!/usr/bin/env node
/**
 * Fix Cloudflare deploy command: change lords-gym-auburn → lords-gym
 * Uses Cloudflare API. Requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.
 *
 * Usage:
 *   node --env-file=.env.local scripts/fix-cloudflare-deploy-command.mjs
 *
 * Add to .env.local:
 *   CLOUDFLARE_API_TOKEN=your_token
 *   CLOUDFLARE_ACCOUNT_ID=31b249266502ceaf30dbbbfcb5f601e0
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = 'https://api.cloudflare.com/client/v4';

function loadEnv() {
  const p = join(__dirname, '..', '.env.local');
  if (!existsSync(p)) return {};
  const raw = readFileSync(p, 'utf8');
  const env = {};
  raw.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
  return env;
}

const env = { ...loadEnv(), ...process.env };
const token = env.CLOUDFLARE_API_TOKEN;
const accountId = env.CLOUDFLARE_ACCOUNT_ID || '31b249266502ceaf30dbbbfcb5f601e0';

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || JSON.stringify(data.errors) || `HTTP ${res.status}`);
  }
  return data;
}

async function main() {
  if (!token) {
    console.error('❌ CLOUDFLARE_API_TOKEN required. Add to .env.local');
    console.error('   Get: https://dash.cloudflare.com/profile/api-tokens');
    console.error('   Needs: Account → Cloudflare Pages → Edit');
    process.exit(1);
  }

  console.log('Listing Pages projects...');
  const { result: projects } = await api(`/accounts/${accountId}/pages/projects`);
  if (!projects?.length) {
    console.log('No Pages projects found.');
    return;
  }

  for (const p of projects) {
    console.log(`\nProject: ${p.name} (${p.subdomain || 'N/A'})`);
  }

  // Try updating lords-gym-auburn first (the one with wrong deploy command), then lords-gym
  const targetProjects = ['lords-gym-auburn', 'lords-gym'].filter((n) =>
    projects.some((p) => p.name === n)
  );

  const newDeployCommand = 'npx wrangler pages deploy dist --project-name=lords-gym';

  for (const projectName of targetProjects) {
    console.log(`\nAttempting to update deploy command for "${projectName}"...`);
    try {
      // PATCH with deployment_configs - structure may vary
      const body = {
        deployment_configs: {
          production: {
            build_command: 'npm run build',
            build_output_dir: 'dist',
            root_dir: '/',
            env_vars: {},
          },
        },
      };

          // Try Pages project PATCH (deployment_configs structure)
      const patchRes = await fetch(`${API}/accounts/${accountId}/pages/projects/${projectName}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const patchData = await patchRes.json();
      if (patchData.success) {
        console.log(`✅ Updated ${projectName} (Pages API)`);
        return;
      }
      // Try Workers Builds API
      const scriptsRes = await fetch(`${API}/accounts/${accountId}/workers/scripts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const scriptsData = await scriptsRes.json();
      if (scriptsData.result?.find((s) => s.id === projectName)) {
        const triggersRes = await fetch(
          `${API}/accounts/${accountId}/workers/scripts/${projectName}/triggers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const triggersData = await triggersRes.json();
        const triggers = triggersData.result?.triggers ?? triggersData.result ?? [];
        const trigger = Array.isArray(triggers) ? triggers[0] : null;
        if (trigger?.trigger_uuid || trigger?.id) {
          const tid = trigger.trigger_uuid || trigger.id;
          const putRes = await fetch(
            `${API}/accounts/${accountId}/workers/scripts/${projectName}/triggers/${tid}`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...trigger, deploy_command: newDeployCommand }),
            }
          );
          const putData = await putRes.json();
          if (putData.success) {
            console.log(`✅ Updated deploy command for ${projectName} (Workers Builds)`);
            return;
          }
        }
      }
    } catch (err) {
      console.warn(`Could not update ${projectName}:`, err.message);
    }
  }

  console.log('\n⚠️ Could not update via API. Update manually in Cloudflare dashboard:');
  console.log('   1. Workers & Pages → lords-gym (Git-connected)');
  console.log('   2. Settings → Build configuration → edit Deploy command');
  console.log(`   3. Set to: ${newDeployCommand}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
