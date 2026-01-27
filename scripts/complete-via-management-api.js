#!/usr/bin/env node

/**
 * Complete Supabase Setup via Management API
 * Uses direct HTTP requests to Supabase Management API
 */

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

const PROJECT_ID = 'mrptukahxloqpdqiaxkb';
const MANAGEMENT_API_BASE = 'https://api.supabase.com/v1';

console.log('🚀 Completing Supabase Setup via Management API\n');
console.log(`📡 Project: ${PROJECT_ID}`);
console.log(`🔗 URL: ${supabaseUrl}\n`);

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('\n📋 To get your service role key:');
  console.error('   1. Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api');
  console.error('   2. Copy the "service_role" key (NOT the anon key)');
  console.error('   3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here\n');
  process.exit(1);
}

async function createStorageBucket() {
  console.log('📦 Creating Storage Bucket via Management API...');
  
  try {
    // Use the Storage REST API with service role key
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
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
      if (data.message?.includes('already exists') || data.message?.includes('duplicate') || data.error?.includes('already exists')) {
        console.log('   ✅ Media bucket already exists\n');
        return { success: true, created: false };
      }
      console.log(`   ❌ Failed: ${data.message || data.error || response.statusText}`);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}\n`);
      return { success: false, error: data.message || data.error || response.statusText };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function createAdminUser() {
  console.log('👤 Creating Admin User via Management API...');
  
  const email = `admin@lordsgym.local`;
  const password = `Admin${Math.random().toString(36).slice(2, 10)}!123`;
  
  try {
    // Use Auth Admin API with service role key
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('   ✅ Admin user created successfully!');
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Password: ${password}`);
      console.log('   ⚠️  SAVE THIS PASSWORD - it will not be shown again!\n');
      return { success: true, email, password, data };
    } else {
      if (data.message?.includes('already exists') || data.error?.includes('already exists') || data.msg?.includes('already exists')) {
        console.log('   ⚠️  User may already exist');
        console.log(`   📧 Check: ${email}\n`);
        return { success: false, error: 'User may already exist' };
      }
      console.log(`   ❌ Failed: ${data.message || data.error || data.msg || response.statusText}`);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}\n`);
      return { success: false, error: data.message || data.error || data.msg || response.statusText };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function verifyStorageBucket() {
  console.log('🔍 Verifying Storage Bucket...');
  
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    });

    const buckets = await response.json();
    
    if (Array.isArray(buckets)) {
      const mediaBucket = buckets.find(b => b.name === 'media');
      if (mediaBucket) {
        console.log('   ✅ Media bucket exists');
        console.log(`   📦 Public: ${mediaBucket.public ? 'Yes' : 'No'}\n`);
        return { success: true, exists: true, bucket: mediaBucket };
      }
    }
    
    console.log('   ❌ Media bucket does not exist\n');
    return { success: false, exists: false };
  } catch (error) {
    console.log(`   ⚠️  Error checking: ${error.message}\n`);
    return { success: false, exists: false };
  }
}

async function verifyDatabase() {
  console.log('🔍 Verifying Database...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/settings?id=eq.default&select=id`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=representation',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        console.log('   ✅ Database tables exist and default data is present\n');
        return { success: true };
      }
    }
    
    console.log('   ⚠️  Could not verify database\n');
    return { success: false };
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
    return { success: false };
  }
}

async function main() {
  // Verify database first
  await verifyDatabase();
  
  // Check storage bucket
  const storageCheck = await verifyStorageBucket();
  
  // Create storage bucket if needed
  if (!storageCheck.exists) {
    await createStorageBucket();
    // Re-verify
    await verifyStorageBucket();
  }

  // Create admin user
  await createAdminUser();

  // Final verification
  console.log('\n' + '='.repeat(70));
  console.log('📊 SETUP COMPLETE');
  console.log('='.repeat(70) + '\n');

  const finalStorageCheck = await verifyStorageBucket();
  const finalDbCheck = await verifyDatabase();

  console.log('✅ FINAL STATUS:');
  console.log(`   Database: ${finalDbCheck.success ? '✅' : '❌'}`);
  console.log(`   Storage Bucket: ${finalStorageCheck.exists ? '✅' : '❌'}`);
  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
