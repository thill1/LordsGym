#!/usr/bin/env node

/**
 * Complete Supabase Setup with Service Role Key
 * This script can create storage buckets and users with service role key
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
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.error('❌ Error: VITE_SUPABASE_URL must be set');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('   Get it from: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api');
  console.error('   Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Completing Supabase Setup with Service Role Key\n');
console.log(`📡 Connected to: ${supabaseUrl}\n`);

async function createStorageBucket() {
  console.log('📦 Creating Storage Bucket...');
  
  try {
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });

    if (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('   ✅ Media bucket already exists\n');
        return { success: true, created: false };
      }
      console.log(`   ❌ Failed: ${error.message}\n`);
      return { success: false, error: error.message };
    }

    console.log('   ✅ Media bucket created successfully!\n');
    return { success: true, created: true, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function createAdminUser() {
  console.log('👤 Creating Admin User...');
  
  const email = `admin@lordsgym.local`;
  const password = `Admin${Math.random().toString(36).slice(2, 10)}!123`;
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('   ⚠️  User may already exist\n');
        return { success: false, error: error.message };
      }
      console.log(`   ❌ Failed: ${error.message}\n`);
      return { success: false, error: error.message };
    }

    console.log('   ✅ Admin user created successfully!');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log('   ⚠️  SAVE THIS PASSWORD - it will not be shown again!\n');
    return { success: true, email, password, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function verifySetup() {
  console.log('🧪 Verifying Setup...\n');
  
  const results = {
    tables: false,
    storage: false,
    defaultData: false
  };

  // Check tables
  try {
    const { error } = await supabase.from('settings').select('id').limit(1);
    results.tables = !error;
  } catch (e) {
    results.tables = false;
  }

  // Check storage
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (!error) {
      const mediaBucket = data?.find(b => b.name === 'media');
      results.storage = !!mediaBucket;
    }
  } catch (e) {
    results.storage = false;
  }

  // Check default data
  try {
    const { data, error } = await supabase.from('settings').select('id').eq('id', 'default').single();
    results.defaultData = !error && !!data;
  } catch (e) {
    results.defaultData = false;
  }

  return results;
}

async function main() {
  // Create storage bucket
  const bucketResult = await createStorageBucket();
  
  // Create admin user
  const userResult = await createAdminUser();
  
  // Verify everything
  const verification = await verifySetup();

  // Final report
  console.log('\n' + '='.repeat(70));
  console.log('📊 SETUP COMPLETE');
  console.log('='.repeat(70) + '\n');

  console.log('✅ RESULTS:');
  console.log(`   Database Tables: ${verification.tables ? '✅' : '❌'}`);
  console.log(`   Storage Bucket: ${bucketResult.success ? '✅' : '❌'}`);
  console.log(`   Default Data: ${verification.defaultData ? '✅' : '❌'}`);
  console.log(`   Admin User: ${userResult.success ? '✅' : '❌'}`);

  if (userResult.success) {
    console.log(`\n📧 Admin Credentials:`);
    console.log(`   Email: ${userResult.email}`);
    console.log(`   Password: ${userResult.password}`);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
