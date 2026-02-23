#!/usr/bin/env node
/**
 * Export schema to supabase-rebuild-lordsgym/exports/
 * Uses LordsGym migrations. No DB connection required.
 *
 * Run from: supabase-rebuild-lordsgym/scripts/node or workspace root
 * Output: exports/schema-YYYYMMDD.sql
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '../..');
const lordsGymRoot = resolve(workspaceRoot, '../');
const migrationsDir = resolve(lordsGymRoot, 'supabase/migrations');
const exportsDir = resolve(workspaceRoot, 'exports');

const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outputPath = resolve(exportsDir, `schema-${date}.sql`);

function main() {
  if (!existsSync(migrationsDir)) {
    console.error('❌ LordsGym supabase/migrations not found:', migrationsDir);
    process.exit(1);
  }

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  files.sort();

  const chunks = [
    `-- Lords Gym Schema Backup (generated ${new Date().toISOString()})`,
    `-- Run in order. Source: LordsGym/supabase/migrations/\n`,
  ];

  for (const file of files) {
    const path = resolve(migrationsDir, file);
    const content = readFileSync(path, 'utf8');
    chunks.push(`\n-- === ${file} ===\n`);
    chunks.push(content);
  }

  mkdirSync(exportsDir, { recursive: true });
  writeFileSync(outputPath, chunks.join('\n'), 'utf8');

  console.log(`✅ Schema backup written to ${outputPath}`);
  console.log(`   (${files.length} migrations)`);
}

main();
