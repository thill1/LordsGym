#!/usr/bin/env node

/**
 * Complete Supabase Setup Script
 * This script completes all Supabase setup tasks via API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
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
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local');
  console.error(`   URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.error(`   Key: ${supabaseAnonKey ? '✅' : '❌'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Starting Supabase setup completion...\n');
console.log(`📡 Connected to: ${supabaseUrl}\n`);

async function checkTables() {
  console.log('🔍 Checking database tables...');
  const tables = [
    'settings', 'home_content', 'products', 'testimonials', 'pages',
    'media', 'instructors', 'calendar_events', 'calendar_recurring_patterns',
    'calendar_recurring_exceptions', 'calendar_bookings', 'page_versions',
    'activity_logs', 'seo_settings', 'schema_markup'
  ];

  const existingTables = [];
  const missingTables = [];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (!error) {
        existingTables.push(table);
      } else if (error.code === 'PGRST116') {
        missingTables.push(table);
      } else {
        missingTables.push(table);
      }
    } catch (e) {
      missingTables.push(table);
    }
  }

  if (existingTables.length === tables.length) {
    console.log(`✅ All ${tables.length} tables exist!\n`);
    return { success: true, existing: existingTables, missing: [] };
  } else {
    console.log(`⚠️  Found ${existingTables.length}/${tables.length} tables`);
    if (missingTables.length > 0) {
      console.log(`   Missing: ${missingTables.join(', ')}\n`);
    }
    return { success: false, existing: existingTables, missing: missingTables };
  }
}

async function checkStorage() {
  console.log('🔍 Checking storage buckets...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`⚠️  Could not check storage buckets: ${error.message}\n`);
      return { success: false, exists: false };
    }
    
    const mediaBucket = data?.find(b => b.name === 'media');
    if (mediaBucket) {
      console.log('✅ Media bucket exists');
      console.log(`   Public: ${mediaBucket.public ? 'Yes' : 'No'}\n`);
      return { success: true, exists: true, bucket: mediaBucket };
    } else {
      console.log('⚠️  Media bucket does not exist\n');
      return { success: false, exists: false };
    }
  } catch (error) {
    console.log(`⚠️  Storage check failed: ${error.message}\n`);
    return { success: false, exists: false };
  }
}

async function createStorageBucket() {
  console.log('📦 Attempting to create storage bucket...');
  try {
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });

    if (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('✅ Media bucket already exists\n');
        return { success: true, created: false };
      }
      console.log(`❌ Error creating bucket: ${error.message}\n`);
      return { success: false, error: error.message };
    }

    console.log('✅ Media bucket created successfully!\n');
    return { success: true, created: true, data };
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function checkDefaultData() {
  console.log('🔍 Checking default data...');
  const checks = [];

  // Check settings
  try {
    const { data, error } = await supabase.from('settings').select('id').eq('id', 'default').single();
    if (!error && data) {
      checks.push({ table: 'settings', exists: true });
    } else {
      checks.push({ table: 'settings', exists: false });
    }
  } catch (e) {
    checks.push({ table: 'settings', exists: false });
  }

  // Check home_content
  try {
    const { data, error } = await supabase.from('home_content').select('id').eq('id', 'default').single();
    if (!error && data) {
      checks.push({ table: 'home_content', exists: true });
    } else {
      checks.push({ table: 'home_content', exists: false });
    }
  } catch (e) {
    checks.push({ table: 'home_content', exists: false });
  }

  // Check seo_settings
  try {
    const { data, error } = await supabase.from('seo_settings').select('id').eq('id', 'default').single();
    if (!error && data) {
      checks.push({ table: 'seo_settings', exists: true });
    } else {
      checks.push({ table: 'seo_settings', exists: false });
    }
  } catch (e) {
    checks.push({ table: 'seo_settings', exists: false });
  }

  const allExist = checks.every(c => c.exists);
  if (allExist) {
    console.log('✅ All default data exists\n');
  } else {
    const missing = checks.filter(c => !c.exists).map(c => c.table);
    console.log(`⚠️  Missing default data in: ${missing.join(', ')}\n`);
  }

  return { success: allExist, checks };
}

async function generateReport(tableCheck, storageCheck, dataCheck) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 SETUP REPORT');
  console.log('='.repeat(70) + '\n');

  console.log('1️⃣  DATABASE TABLES');
  if (tableCheck.success) {
    console.log('   ✅ All 15 tables exist');
  } else {
    console.log(`   ⚠️  ${tableCheck.existing.length}/15 tables exist`);
    if (tableCheck.missing.length > 0) {
      console.log(`   ❌ Missing: ${tableCheck.missing.join(', ')}`);
      console.log('   📝 Action: Run migration SQL in Supabase dashboard');
    }
  }

  console.log('\n2️⃣  STORAGE BUCKET');
  if (storageCheck.exists) {
    console.log('   ✅ Media bucket exists');
    console.log(`   📦 Public: ${storageCheck.bucket?.public ? 'Yes' : 'No'}`);
  } else {
    console.log('   ❌ Media bucket does not exist');
    console.log('   📝 Action: Create "media" bucket in Storage section');
  }

  console.log('\n3️⃣  DEFAULT DATA');
  if (dataCheck.success) {
    console.log('   ✅ All default data exists');
  } else {
    const missing = dataCheck.checks.filter(c => !c.exists).map(c => c.table);
    console.log(`   ⚠️  Missing default data in: ${missing.join(', ')}`);
    if (!tableCheck.success) {
      console.log('   📝 Action: Run migration SQL (includes default data)');
    }
  }

  console.log('\n4️⃣  ADMIN USER');
  console.log('   📝 Action: Create admin user manually in Auth > Users');
  console.log('   📝 Add metadata: {"role": "admin"}');

  console.log('\n' + '='.repeat(70) + '\n');

  // Provide next steps
  if (!tableCheck.success || !storageCheck.exists) {
    console.log('📋 NEXT STEPS:\n');
    
    if (!tableCheck.success) {
      console.log('1. Run Database Migration:');
      console.log('   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/sql/new');
      console.log('   - Copy/paste: supabase/migrations/003_complete_schema.sql');
      console.log('   - Click Run\n');
    }

    if (!storageCheck.exists) {
      console.log('2. Create Storage Bucket:');
      console.log('   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets');
      console.log('   - Create bucket: media (public)\n');
    }

    console.log('3. Create Admin User:');
    console.log('   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users');
    console.log('   - Add user with metadata: {"role": "admin"}\n');
  } else {
    console.log('✅ Setup is mostly complete! Just create an admin user.\n');
  }
}

async function main() {
  const tableCheck = await checkTables();
  const storageCheck = await checkStorage();
  const dataCheck = await checkDefaultData();

  // Try to create storage bucket if it doesn't exist
  if (!storageCheck.exists) {
    const createResult = await createStorageBucket();
    if (createResult.success && createResult.created) {
      storageCheck.exists = true;
      storageCheck.bucket = createResult.data;
    }
  }

  await generateReport(tableCheck, storageCheck, dataCheck);
}

main().catch(console.error);
