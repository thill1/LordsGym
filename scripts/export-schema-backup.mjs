#!/usr/bin/env node
/**
 * Export schema backup: concatenate all migrations into a single SQL file.
 * Always works (no DB connection required). Useful for portable schema backup.
 *
 * Run: node scripts/export-schema-backup.mjs
 * Output: backup/schema-YYYYMMDD.sql
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const migrationsDir = resolve(root, 'supabase', 'migrations');
const backupDir = resolve(root, 'backup');

const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outputPath = resolve(backupDir, `schema-${date}.sql`);

function main() {
  if (!existsSync(migrationsDir)) {
    console.error('❌ supabase/migrations directory not found');
    process.exit(1);
  }

  let files;
  try {
    files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  } catch (e) {
    console.error('❌ Cannot read migrations:', e.message);
    process.exit(1);
  }

  // Sort by filename (001_, 002_, 003_, 20250207_, etc.)
  files.sort();

  const chunks = [
    `-- Lords Gym Schema Backup (generated ${new Date().toISOString()})`,
    `-- Run in order. Source: supabase/migrations/\n`,
  ];

  for (const file of files) {
    const path = resolve(migrationsDir, file);
    const content = readFileSync(path, 'utf8');
    chunks.push(`\n-- === ${file} ===\n`);
    chunks.push(content);
  }

  mkdirSync(backupDir, { recursive: true });
  writeFileSync(outputPath, chunks.join('\n'), 'utf8');

  console.log(`✅ Schema backup written to ${outputPath}`);
  console.log(`   (${files.length} migrations)`);
}

main();
