#!/usr/bin/env node
/**
 * Create a backup Supabase project via Management API.
 * Fallback: print step-by-step manual instructions.
 *
 * Required in .env.local:
 *   SUPABASE_ACCESS_TOKEN
 *
 * Optional (for API create):
 *   BACKUP_DB_PASSWORD  - DB password for the new project
 *   BACKUP_PROJECT_NAME - Default: "Lords Gym Backup"
 *   BACKUP_ORG_SLUG    - Org slug (try to auto-detect if omitted)
 *
 * Run: node --env-file=.env.local scripts/create-backup-project.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const PRIMARY_REF = 'mrptukahxloqpdqiaxkb';
const API_BASE = 'https://api.supabase.com/v1';

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv(resolve(root, '.env.local'));
loadEnv(resolve(root, '.env'));

const token = process.env.SUPABASE_ACCESS_TOKEN;
const dbPass = process.env.BACKUP_DB_PASSWORD;
const projectName = process.env.BACKUP_PROJECT_NAME || 'Lords Gym Backup';
const orgSlug = process.env.BACKUP_ORG_SLUG;

async function fetchOrgs() {
  const res = await fetch(`${API_BASE}/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data : data?.organizations || [];
}

async function createProject() {
  let slug = orgSlug;
  if (!slug) {
    const orgs = await fetchOrgs();
    if (orgs?.length) slug = orgs[0].slug || orgs[0].name;
  }
  if (!slug) {
    console.log('   ⚠️  Could not determine organization_slug. Use BACKUP_ORG_SLUG in .env.local');
    return null;
  }

  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      organization_slug: slug,
      db_pass: dbPass,
      region: 'us-west-2',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

function printManualInstructions() {
  console.log(`
---
📋 Manual creation (if API fails or BACKUP_DB_PASSWORD not set)
---
1. Go to https://supabase.com/dashboard → New project
2. Name: "${projectName}"
3. Database password: choose and save securely
4. Region: us-west-2
5. Create project
6. Then run:
   npx supabase link --project-ref <NEW_PROJECT_REF>
   npm run db:push
   node scripts/complete-supabase-with-service-key.js
   (with VITE_SUPABASE_URL and keys pointing to the new project)

See docs/SUPABASE_BACKUP_DATABASE.md for full steps.
`);
}

async function main() {
  console.log('🔧 Lords Gym — Create Backup Supabase Project\n');

  if (!token) {
    console.error('❌ SUPABASE_ACCESS_TOKEN required in .env.local');
    console.error('   Get from: https://supabase.com/dashboard/account/tokens\n');
    process.exit(1);
  }

  if (!dbPass) {
    console.log('⚠️  BACKUP_DB_PASSWORD not set. Cannot create via API.');
    printManualInstructions();
    process.exit(0);
  }

  try {
    console.log('Creating project via Management API...');
    const project = await createProject();
    if (project) {
      const ref = project.ref || project.id;
      console.log(`\n✅ Project created: ${ref}`);
      console.log(`   Name: ${project.name || projectName}`);
      console.log(`   URL: https://${ref}.supabase.co`);
      console.log(`   Status: ${project.status || 'INACTIVE'}`);
      console.log('\nNext steps:');
      console.log(`   1. Wait ~2 min for project to provision`);
      console.log(`   2. npx supabase link --project-ref ${ref}`);
      console.log(`   3. npm run db:push`);
      console.log(`   4. Update .env.local with new project URL/keys`);
      console.log(`   5. node scripts/complete-supabase-with-service-key.js`);
    } else {
      printManualInstructions();
    }
  } catch (err) {
    console.error(`\n❌ API create failed: ${err.message}`);
    printManualInstructions();
    process.exit(1);
  }
}

main();
