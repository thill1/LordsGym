#!/usr/bin/env node

/**
 * Verify Supabase Setup and Provide Manual Instructions
 * Works with just the anon key for verification
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

console.log('🔍 Verifying Supabase Setup\n');
console.log(`📡 Connected to: ${supabaseUrl}\n`);

async function checkDatabase() {
  console.log('📊 Checking Database...');
  
  try {
    const { data, error } = await supabase.from('settings').select('id').eq('id', 'default').limit(1);
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      return { success: false };
    }
    
    if (data && data.length > 0) {
      console.log('   ✅ Database tables exist');
      console.log('   ✅ Default data present\n');
      return { success: true };
    } else {
      console.log('   ⚠️  Tables exist but default data missing\n');
      return { success: false };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return { success: false };
  }
}

async function checkStorageBucket() {
  console.log('📦 Checking Storage Bucket...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`   ⚠️  Could not check: ${error.message}`);
      console.log('   (This might require service role key)\n');
      return { exists: false, canCheck: false };
    }
    
    const mediaBucket = data?.find(b => b.name === 'media');
    if (mediaBucket) {
      console.log('   ✅ Media bucket exists');
      console.log(`   📦 Public: ${mediaBucket.public ? 'Yes' : 'No'}\n`);
      return { exists: true, bucket: mediaBucket };
    } else {
      console.log('   ❌ Media bucket does not exist\n');
      return { exists: false, canCheck: true };
    }
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
    return { exists: false, canCheck: false };
  }
}

async function main() {
  const dbCheck = await checkDatabase();
  const storageCheck = await checkStorageBucket();
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SETUP STATUS');
  console.log('='.repeat(70) + '\n');
  
  console.log('✅ COMPLETED:');
  console.log(`   Database Tables: ${dbCheck.success ? '✅' : '❌'}`);
  console.log(`   Storage Bucket: ${storageCheck.exists ? '✅' : '❌'}`);
  
  if (!storageCheck.exists) {
    console.log('\n📋 MANUAL SETUP REQUIRED:\n');
    console.log('1. Create Storage Bucket:');
    console.log('   → Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets');
    console.log('   → Click "New bucket"');
    console.log('   → Name: media');
    console.log('   → Check "Public bucket"');
    console.log('   → Click "Create bucket"\n');
    
    console.log('2. Create Admin User:');
    console.log('   → Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users');
    console.log('   → Click "Add user" → "Create new user"');
    console.log('   → Email: admin@lordsgym.local');
    console.log('   → Password: (choose secure password)');
    console.log('   → Check "Auto Confirm User"');
    console.log('   → Click "Advanced" → Add metadata: {"role": "admin"}');
    console.log('   → Click "Create user"\n');
    
    console.log('After completing these steps, run this script again to verify.\n');
  }
  
  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
