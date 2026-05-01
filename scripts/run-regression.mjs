#!/usr/bin/env node
/**
 * Run all tests in the regression queue (tests/regression-queue.json).
 * Used locally and by the weekly regression workflow.
 *
 * Usage: node scripts/run-regression.mjs [--continue-on-error]
 *   --continue-on-error  Do not exit on first failure; run all tests and report at end
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const queuePath = path.join(root, 'tests', 'regression-queue.json');

const continueOnError = process.argv.includes('--continue-on-error');

if (!fs.existsSync(queuePath)) {
  console.error('Regression queue not found:', queuePath);
  process.exit(1);
}

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const tests = queue.tests || [];

if (tests.length === 0) {
  console.log('No tests in regression queue.');
  process.exit(0);
}

console.log(`Running ${tests.length} regression test(s)...\n`);
const results = [];
let hasFailure = false;

for (const t of tests) {
  process.stdout.write(`[${t.id}] ${t.name}... `);
  const result = spawnSync(t.command, [], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, CI: process.env.CI || '1' },
  });
  const ok = result.status === 0;
  const optional = t.optional === true;
  if (!ok && !optional) hasFailure = true;
  results.push({ id: t.id, name: t.name, ok, optional });
  console.log(ok ? '✓' : optional ? '(optional ✗)' : '✗');
  if (!ok && !optional && !continueOnError) {
    console.error(`\nRegression test "${t.id}" failed. Exiting.`);
    process.exit(1);
  }
}

console.log('\n--- Summary ---');
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.id}: ${r.name}`);
}
if (hasFailure) {
  process.exit(1);
}
console.log('\nAll regression tests passed.');
