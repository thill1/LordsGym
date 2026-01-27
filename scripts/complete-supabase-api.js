#!/usr/bin/env node

/**
 * Complete Supabase Setup via Management API
 * Uses HTTP requests to create storage bucket and admin user
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

console.log('🚀 Completing Supabase Setup via API\n');
console.log(`📡 Connected to: ${supabaseUrl}\n`);

async function createStorageBucketViaAPI() {
  console.log('📦 Creating Storage Bucket via API...');
  
  try {
    // Try using the storage REST API endpoint
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'media',
        public: true,
        file_size_limit: 52428800, // 50MB
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('   ✅ Media bucket created successfully!\n');
      return { success: true, created: true };
    } else {
      if (data.message?.includes('already exists') || data.message?.includes('duplicate')) {
        console.log('   ✅ Media bucket already exists\n');
        return { success: true, created: false };
      }
      console.log(`   ❌ Failed: ${data.message || response.statusText}\n`);
      return { success: false, error: data.message || response.statusText };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function checkStorageBucket() {
  console.log('🔍 Checking Storage Bucket...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`   ⚠️  Could not check: ${error.message}\n`);
      return { success: false, exists: false };
    }

    const mediaBucket = data?.find(b => b.name === 'media');
    if (mediaBucket) {
      console.log('   ✅ Media bucket exists');
      console.log(`   📦 Public: ${mediaBucket.public ? 'Yes' : 'No'}\n`);
      return { success: true, exists: true, bucket: mediaBucket };
    } else {
      console.log('   ❌ Media bucket does not exist\n');
      return { success: false, exists: false };
    }
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
    return { success: false, exists: false };
  }
}

async function createAdminUserViaAPI() {
  console.log('👤 Creating Admin User via API...');
  
  // Note: User creation via Auth API requires service role key
  // We'll try with anon key but it will likely fail
  try {
    const email = `admin-${Date.now()}@lordsgym.local`;
    const password = `Admin${Math.random().toString(36).slice(2)}123!`;
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (error) {
      if (error.message.includes('JWT')) {
        console.log('   ⚠️  Requires service role key (not available)\n');
        console.log('   📝 User creation requires dashboard access\n');
        return { success: false, requiresDashboard: true };
      }
      console.log(`   ❌ Failed: ${error.message}\n`);
      return { success: false, error: error.message };
    }

    console.log('   ✅ Admin user created successfully!');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}\n`);
    return { success: true, email, password };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    console.log('   📝 User creation requires dashboard access\n');
    return { success: false, requiresDashboard: true };
  }
}

async function verifyEverything() {
  console.log('🧪 Verifying Setup...\n');
  
  const results = {
    tables: false,
    storage: false,
    defaultData: false,
    adminUser: false
  };

  // Check tables
  try {
    const { error } = await supabase.from('settings').select('id').limit(1);
    results.tables = !error;
  } catch (e) {
    results.tables = false;
  }

  // Check storage
  const storageCheck = await checkStorageBucket();
  results.storage = storageCheck.exists;

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
  // Check current storage status
  const storageCheck = await checkStorageBucket();
  
  // Try to create storage bucket if it doesn't exist
  if (!storageCheck.exists) {
    await createStorageBucketViaAPI();
    // Re-check
    await checkStorageBucket();
  }

  // Try to create admin user
  await createAdminUserViaAPI();

  // Verify everything
  const verification = await verifyEverything();

  // Final report
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL SETUP REPORT');
  console.log('='.repeat(70) + '\n');

  console.log('✅ COMPLETED:');
  console.log(`   Database Tables: ${verification.tables ? '✅' : '❌'}`);
  console.log(`   Storage Bucket: ${verification.storage ? '✅' : '❌'}`);
  console.log(`   Default Data: ${verification.defaultData ? '✅' : '❌'}`);
  console.log(`   Admin User: ${verification.adminUser ? '✅' : '❌'}`);

  console.log('\n' + '='.repeat(70) + '\n');

  if (!verification.storage || !verification.adminUser) {
    console.log('📋 REMAINING TASKS (Dashboard Required):\n');
    if (!verification.storage) {
      console.log('1. Create Storage Bucket:');
      console.log('   https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets\n');
    }
    if (!verification.adminUser) {
      console.log('2. Create Admin User:');
      console.log('   https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users\n');
    }
  } else {
    console.log('🎉 All tasks completed!\n');
  }
}

main().catch(console.error);
