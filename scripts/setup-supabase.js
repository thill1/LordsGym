#!/usr/bin/env node

/**
 * Supabase Setup Script
 * This script helps automate Supabase setup tasks
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Starting Supabase setup...\n');

// Read the migration SQL file
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '003_complete_schema.sql');
let migrationSQL;

try {
  migrationSQL = readFileSync(migrationPath, 'utf-8');
  console.log('✅ Migration file loaded\n');
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
  process.exit(1);
}

async function checkConnection() {
  console.log('🔍 Checking Supabase connection...');
  try {
    const { data, error } = await supabase.from('settings').select('id').limit(1);
    if (error && error.code === 'PGRST116') {
      console.log('✅ Connected to Supabase (tables not created yet)\n');
      return true;
    } else if (error) {
      console.log('⚠️  Connection check:', error.message);
      return true; // Still proceed
    } else {
      console.log('✅ Connected to Supabase\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('🔍 Checking if tables exist...');
  const tables = [
    'settings', 'home_content', 'products', 'testimonials', 'pages',
    'media', 'instructors', 'calendar_events', 'calendar_recurring_patterns',
    'calendar_recurring_exceptions', 'calendar_bookings', 'page_versions',
    'activity_logs', 'seo_settings', 'schema_markup'
  ];

  const existingTables = [];
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (!error) {
        existingTables.push(table);
      }
    } catch (e) {
      // Table doesn't exist
    }
  }

  if (existingTables.length > 0) {
    console.log(`⚠️  Found ${existingTables.length} existing tables: ${existingTables.join(', ')}`);
    console.log('   The migration uses IF NOT EXISTS, so it\'s safe to run.\n');
  } else {
    console.log('✅ No existing tables found. Ready to run migration.\n');
  }
}

async function checkStorage() {
  console.log('🔍 Checking storage buckets...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('⚠️  Could not check storage buckets:', error.message);
      return false;
    }
    
    const mediaBucket = data?.find(b => b.name === 'media');
    if (mediaBucket) {
      console.log('✅ Media bucket already exists\n');
      return true;
    } else {
      console.log('⚠️  Media bucket does not exist (will need to be created)\n');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Storage check failed:', error.message);
    return false;
  }
}

function displayInstructions() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 SETUP INSTRUCTIONS');
  console.log('='.repeat(70) + '\n');

  console.log('1️⃣  RUN DATABASE MIGRATION');
  console.log('   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/sql/new');
  console.log('   - Copy the contents of: supabase/migrations/003_complete_schema.sql');
  console.log('   - Paste into SQL Editor');
  console.log('   - Click "Run" (or press Ctrl+Enter)\n');

  console.log('2️⃣  CREATE STORAGE BUCKET');
  console.log('   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets');
  console.log('   - Click "New bucket"');
  console.log('   - Name: media');
  console.log('   - Check "Public bucket"');
  console.log('   - Click "Create bucket"\n');

  console.log('3️⃣  CREATE ADMIN USER');
  console.log('   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users');
  console.log('   - Click "Add user" > "Create new user"');
  console.log('   - Enter email and password');
  console.log('   - Click "Advanced" and add metadata:');
  console.log('     {"role": "admin"}');
  console.log('   - Click "Create user"\n');

  console.log('4️⃣  VERIFY SETUP');
  console.log('   - Run: npm run dev');
  console.log('   - Navigate to /admin');
  console.log('   - Log in with your admin user');
  console.log('   - Verify data loads from Supabase\n');

  console.log('='.repeat(70) + '\n');
}

async function main() {
  const connected = await checkConnection();
  if (!connected) {
    console.log('⚠️  Could not verify connection, but proceeding with instructions...\n');
  }

  await checkTables();
  await checkStorage();
  
  displayInstructions();

  console.log('💡 TIP: After running the migration, you can verify it worked by checking');
  console.log('   the Tables section in your Supabase dashboard.\n');
}

main().catch(console.error);
