#!/usr/bin/env node
/**
 * Run Supabase CLI inspect commands and produce a consolidated database health report.
 * Requires one of:
 *   - SUPABASE_ACCESS_TOKEN (sbp_xxx) + linked project
 *   - SUPABASE_DB_PASSWORD + VITE_SUPABASE_URL (builds --db-url)
 *
 * Usage: node --env-file=.env.local scripts/supabase-inspect-report.mjs [--output json|pretty]
 */
import { spawnSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const paths = [resolve(root, '.env.local'), resolve(root, '.env')];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    const content = readFileSync(p, 'utf8');
    for (const line of content.split(/\r?\n/)) {
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

const url = process.env.VITE_SUPABASE_URL || '';
const projectRef = url.replace(/^https?:\/\//, '').split('.')[0];
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

let dbUrl = null;
if (dbPassword && projectRef) {
  const encoded = encodeURIComponent(dbPassword);
  dbUrl = `postgresql://postgres.${projectRef}:${encoded}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
}

const hasAccess = accessToken?.startsWith('sbp_') || dbUrl;
if (!hasAccess) {
  console.error('Add to .env.local:');
  console.error('  SUPABASE_ACCESS_TOKEN=sbp_xxx  (from https://supabase.com/dashboard/account/tokens)');
  console.error('  OR SUPABASE_DB_PASSWORD=...');
  process.exit(1);
}

const output = process.argv.includes('--output') 
  ? process.argv[process.argv.indexOf('--output') + 1] || 'pretty'
  : 'pretty';

const COMMANDS = [
  { id: 'outliers', name: 'Slow/Resource-Intensive Queries', cmd: ['inspect', 'db', 'outliers'] },
  { id: 'calls', name: 'Most-Called Queries', cmd: ['inspect', 'db', 'calls'] },
  { id: 'long-running', name: 'Long-Running Queries (>5min)', cmd: ['inspect', 'db', 'long-running-queries'] },
  { id: 'blocking', name: 'Lock Blocking', cmd: ['inspect', 'db', 'blocking'] },
  { id: 'index-stats', name: 'Index Stats (usage, unused)', cmd: ['inspect', 'db', 'index-stats'] },
  { id: 'table-stats', name: 'Table Sizes', cmd: ['inspect', 'db', 'table-stats'] },
  { id: 'db-stats', name: 'DB Stats (cache, WAL)', cmd: ['inspect', 'db', 'db-stats'] },
  { id: 'bloat', name: 'Table Bloat', cmd: ['inspect', 'db', 'bloat'] },
  { id: 'vacuum-stats', name: 'Vacuum Stats', cmd: ['inspect', 'db', 'vacuum-stats'] },
  { id: 'traffic-profile', name: 'Read/Write Traffic', cmd: ['inspect', 'db', 'traffic-profile'] },
];

const report = { timestamp: new Date().toISOString(), projectRef, sections: {} };

function run(cmd, extra = []) {
  const args = ['supabase', ...cmd, '-o', output === 'json' ? 'json' : 'pretty'];
  if (dbUrl) args.push('--db-url', dbUrl);
  args.push(...extra);
  const result = spawnSync('npx', args, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
  });
  return { stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
}

console.log('# Supabase Database Inspect Report\n');
console.log(`Project: ${projectRef}`);
console.log(`Run: ${new Date().toISOString()}\n`);

for (const { id, name, cmd } of COMMANDS) {
  console.log(`## ${name}\n`);
  const { stdout, stderr, status } = run(cmd);
  if (stdout) console.log(stdout);
  if (stderr && status !== 0) console.error(stderr);
  report.sections[id] = { name, status, output: stdout, error: stderr };
  console.log('');
}

console.log('---');
console.log('Note: 113 Advisor issues are in Supabase Dashboard → Database → Security Advisor / Performance Advisor.');
console.log('The CLI inspect commands above cover slow queries, indexes, bloat, and traffic.');
