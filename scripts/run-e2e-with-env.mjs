#!/usr/bin/env node
/**
 * Run Playwright e2e tests with .env.local loaded (for ADMIN_EMAIL, ADMIN_PASSWORD, etc.)
 * Usage: node --env-file=.env.local scripts/run-e2e-with-env.mjs [args...]
 */
import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const args = process.argv.slice(2);
const result = spawnSync(
  'npx',
  ['playwright', 'test', ...args],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env },
    shell: true,
  }
);
process.exit(result.status ?? 1);
