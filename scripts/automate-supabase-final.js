#!/usr/bin/env node

/**
 * Final Supabase Automation Script
 * Attempts to complete all setup tasks via API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvFile() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) {
    return {};
  }
  
  const envContent = readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

const env = loadEnvFile();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Final Supabase Automation Attempt\n');
console.log(`📡 Connected to: ${supabaseUrl}\n`);

const results = {
  tables: { success: false, count: 0, total: 15 },
  storage: { success: false, created: false },
  defaultData: { success: false },
  adminUser: { success: false, note: 'Requires dashboard' }
};

// Check tables
async function verifyTables() {
  console.log('1️⃣  Verifying Database Tables...');
  const tables = [
    'settings', 'home_content', 'products', 'testimonials', 'pages',
    'media', 'instructors', 'calendar_events', 'calendar_recurring_patterns',
    'calendar_recurring_exceptions', 'calendar_bookings', 'page_versions',
    'activity_logs', 'seo_settings', 'schema_markup'
  ];

  let count = 0;
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (!error) count++;
    } catch (e) {
      // Table doesn't exist
    }
  }

  results.tables.count = count;
  results.tables.success = count === tables.length;
  
  if (results.tables.success) {
    console.log(`   ✅ All ${count} tables exist\n`);
  } else {
    console.log(`   ⚠️  ${count}/${tables.length} tables exist\n`);
  }
}

// Try to create storage bucket
async function createStorageBucket() {
  console.log('2️⃣  Creating Storage Bucket...');
  
  try {
    // Try using storage API
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true,
      fileSizeLimit: 52428800,
    });

    if (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('   ✅ Media bucket already exists\n');
        results.storage.success = true;
        results.storage.created = false;
        return;
      }
      console.log(`   ❌ Failed: ${error.message}\n`);
      console.log('   📝 Note: Requires dashboard access or service role key\n');
      return;
    }

    console.log('   ✅ Media bucket created successfully!\n');
    results.storage.success = true;
    results.storage.created = true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    console.log('   📝 Note: Requires dashboard access\n');
  }
}

// Check default data
async function verifyDefaultData() {
  console.log('3️⃣  Verifying Default Data...');
  
  const checks = [];
  
  try {
    const { data, error } = await supabase.from('settings').select('id').eq('id', 'default').single();
    checks.push({ name: 'settings', exists: !error && !!data });
  } catch (e) {
    checks.push({ name: 'settings', exists: false });
  }

  try {
    const { data, error } = await supabase.from('home_content').select('id').eq('id', 'default').single();
    checks.push({ name: 'home_content', exists: !error && !!data });
  } catch (e) {
    checks.push({ name: 'home_content', exists: false });
  }

  try {
    const { data, error } = await supabase.from('seo_settings').select('id').eq('id', 'default').single();
    checks.push({ name: 'seo_settings', exists: !error && !!data });
  } catch (e) {
    checks.push({ name: 'seo_settings', exists: false });
  }

  const allExist = checks.every(c => c.exists);
  results.defaultData.success = allExist;

  if (allExist) {
    console.log('   ✅ All default data exists\n');
  } else {
    const missing = checks.filter(c => !c.exists).map(c => c.name);
    console.log(`   ⚠️  Missing: ${missing.join(', ')}\n`);
  }
}

// Check storage bucket exists
async function checkStorageBucket() {
  console.log('4️⃣  Checking Storage Bucket...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`   ⚠️  Could not check: ${error.message}\n`);
      return;
    }

    const mediaBucket = data?.find(b => b.name === 'media');
    if (mediaBucket) {
      console.log('   ✅ Media bucket exists');
      console.log(`   📦 Public: ${mediaBucket.public ? 'Yes' : 'No'}\n`);
      results.storage.success = true;
    } else {
      console.log('   ❌ Media bucket does not exist\n');
      // Try to create it
      await createStorageBucket();
    }
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
  }
}

// Generate final report
function generateFinalReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL SETUP REPORT');
  console.log('='.repeat(70) + '\n');

  console.log('✅ COMPLETED VIA API:');
  console.log(`   Database Tables: ${results.tables.success ? '✅' : '⚠️'} ${results.tables.count}/15`);
  console.log(`   Default Data: ${results.defaultData.success ? '✅' : '⚠️'}`);
  console.log(`   Storage Bucket: ${results.storage.success ? '✅' : '❌'}`);

  console.log('\n❌ REQUIRES DASHBOARD ACCESS:');
  console.log('   Admin User: ❌ (Must create manually)');

  console.log('\n' + '='.repeat(70) + '\n');

  if (!results.storage.success) {
    console.log('📋 REMAINING MANUAL STEPS:\n');
    console.log('1. Create Storage Bucket:');
    console.log('   https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets');
    console.log('   - Name: media');
    console.log('   - Public: Yes\n');

    console.log('2. Create Admin User:');
    console.log('   https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users');
    console.log('   - Add metadata: {"role": "admin"}\n');
  }

  const completion = (
    (results.tables.success ? 1 : 0) +
    (results.storage.success ? 1 : 0) +
    (results.defaultData.success ? 1 : 0)
  ) / 4 * 100;

  console.log(`\n📈 Overall Completion: ${completion.toFixed(0)}%\n`);
}

async function main() {
  await verifyTables();
  await checkStorageBucket();
  await verifyDefaultData();
  generateFinalReport();
}

main().catch(console.error);
