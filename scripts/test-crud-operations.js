#!/usr/bin/env node

/**
 * Comprehensive CRUD Operations Test for Supabase
 * Tests all database operations: Create, Read, Update, Delete
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
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Environment variables not set');
  process.exit(1);
}

// Use service role key for testing (bypasses RLS)
const supabase = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : createClient(supabaseUrl, supabaseAnonKey);

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
    console.log(`   ✅ ${name}${message ? ': ' + message : ''}`);
  } else {
    testResults.failed++;
    console.log(`   ❌ ${name}${message ? ': ' + message : ''}`);
  }
}

console.log('🧪 Testing CRUD Operations for Supabase Database\n');
console.log(`📡 Connected to: ${supabaseUrl}`);
console.log(`🔑 Using: ${serviceRoleKey ? 'Service Role Key' : 'Anon Key'}\n`);

// ============================================================================
// TEST 1: SETTINGS (Read & Update/Upsert)
// ============================================================================
async function testSettings() {
  console.log('📋 Testing SETTINGS table...');
  
  try {
    // READ: Get settings
    const { data: readData, error: readError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'default')
      .single();
    
    logTest('Settings READ', !readError && readData, readError?.message);
    
    if (readData) {
      // UPDATE: Update settings
      const updatedSettings = {
        ...readData,
        site_name: `Test Update ${Date.now()}`,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('settings')
        .upsert(updatedSettings, { onConflict: 'id' });
      
      logTest('Settings UPDATE/UPSERT', !updateError, updateError?.message);
      
      // Verify update
      const { data: verifyData } = await supabase
        .from('settings')
        .select('site_name')
        .eq('id', 'default')
        .single();
      
      logTest('Settings UPDATE Verification', verifyData?.site_name === updatedSettings.site_name);
      
      // Restore original
      await supabase
        .from('settings')
        .upsert(readData, { onConflict: 'id' });
    }
  } catch (error) {
    logTest('Settings Operations', false, error.message);
  }
  
  console.log('');
}

// ============================================================================
// TEST 2: HOME_CONTENT (Read & Update/Upsert)
// ============================================================================
async function testHomeContent() {
  console.log('🏠 Testing HOME_CONTENT table...');
  
  try {
    // READ: Get home content
    const { data: readData, error: readError } = await supabase
      .from('home_content')
      .select('*')
      .eq('id', 'default')
      .single();
    
    logTest('Home Content READ', !readError && readData, readError?.message);
    
    if (readData) {
      // UPDATE: Update home content
      const updatedContent = {
        ...readData,
        hero: {
          ...readData.hero,
          headline: `Test Headline ${Date.now()}`
        },
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('home_content')
        .upsert(updatedContent, { onConflict: 'id' });
      
      logTest('Home Content UPDATE/UPSERT', !updateError, updateError?.message);
      
      // Verify update
      const { data: verifyData } = await supabase
        .from('home_content')
        .select('hero')
        .eq('id', 'default')
        .single();
      
      logTest('Home Content UPDATE Verification', verifyData?.hero?.headline === updatedContent.hero.headline);
      
      // Restore original
      await supabase
        .from('home_content')
        .upsert(readData, { onConflict: 'id' });
    }
  } catch (error) {
    logTest('Home Content Operations', false, error.message);
  }
  
  console.log('');
}

// ============================================================================
// TEST 3: TESTIMONIALS (Create, Read, Update, Delete)
// ============================================================================
async function testTestimonials() {
  console.log('💬 Testing TESTIMONIALS table...');
  
  let testTestimonialId = null;
  
  try {
    // CREATE: Insert new testimonial
    const newTestimonial = {
      name: `Test User ${Date.now()}`,
      role: 'Test Role',
      quote: 'This is a test testimonial for CRUD testing.'
    };
    
    const { data: createData, error: createError } = await supabase
      .from('testimonials')
      .insert(newTestimonial)
      .select()
      .single();
    
    logTest('Testimonials CREATE', !createError && createData, createError?.message);
    
    if (createData) {
      testTestimonialId = createData.id;
      
      // READ: Get the created testimonial
      const { data: readData, error: readError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('id', testTestimonialId)
        .single();
      
      logTest('Testimonials READ', !readError && readData, readError?.message);
      
      // UPDATE: Update the testimonial
      const updatedTestimonial = {
        ...readData,
        quote: `Updated quote ${Date.now()}`,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('testimonials')
        .update({
          quote: updatedTestimonial.quote,
          updated_at: updatedTestimonial.updated_at
        })
        .eq('id', testTestimonialId);
      
      logTest('Testimonials UPDATE', !updateError, updateError?.message);
      
      // Verify update
      const { data: verifyData } = await supabase
        .from('testimonials')
        .select('quote')
        .eq('id', testTestimonialId)
        .single();
      
      logTest('Testimonials UPDATE Verification', verifyData?.quote === updatedTestimonial.quote);
      
      // DELETE: Delete the test testimonial
      const { error: deleteError } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testTestimonialId);
      
      logTest('Testimonials DELETE', !deleteError, deleteError?.message);
      
      // Verify deletion
      const { data: verifyDelete } = await supabase
        .from('testimonials')
        .select('id')
        .eq('id', testTestimonialId)
        .single();
      
      logTest('Testimonials DELETE Verification', !verifyDelete);
    }
  } catch (error) {
    logTest('Testimonials Operations', false, error.message);
    
    // Cleanup if needed
    if (testTestimonialId) {
      await supabase.from('testimonials').delete().eq('id', testTestimonialId);
    }
  }
  
  console.log('');
}

// ============================================================================
// TEST 4: PRODUCTS (Create, Read, Update, Delete)
// ============================================================================
async function testProducts() {
  console.log('🛍️  Testing PRODUCTS table...');
  
  const testProductId = `test-product-${Date.now()}`;
  
  try {
    // CREATE: Insert new product
    const newProduct = {
      id: testProductId,
      title: `Test Product ${Date.now()}`,
      price: 29.99,
      category: 'test',
      image: '/test-image.jpg',
      description: 'Test product for CRUD testing',
      featured: false
    };
    
    const { data: createData, error: createError } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single();
    
    logTest('Products CREATE', !createError && createData, createError?.message);
    
    if (createData) {
      // READ: Get the created product
      const { data: readData, error: readError } = await supabase
        .from('products')
        .select('*')
        .eq('id', testProductId)
        .single();
      
      logTest('Products READ', !readError && readData, readError?.message);
      
      // UPDATE: Update the product
      const updatedProduct = {
        ...readData,
        title: `Updated Product ${Date.now()}`,
        price: 39.99,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('products')
        .update({
          title: updatedProduct.title,
          price: updatedProduct.price,
          updated_at: updatedProduct.updated_at
        })
        .eq('id', testProductId);
      
      logTest('Products UPDATE', !updateError, updateError?.message);
      
      // Verify update
      const { data: verifyData } = await supabase
        .from('products')
        .select('title, price')
        .eq('id', testProductId)
        .single();
      
      logTest('Products UPDATE Verification', 
        verifyData?.title === updatedProduct.title && 
        parseFloat(verifyData?.price) === updatedProduct.price);
      
      // DELETE: Delete the test product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', testProductId);
      
      logTest('Products DELETE', !deleteError, deleteError?.message);
      
      // Verify deletion
      const { data: verifyDelete } = await supabase
        .from('products')
        .select('id')
        .eq('id', testProductId)
        .single();
      
      logTest('Products DELETE Verification', !verifyDelete);
    }
  } catch (error) {
    logTest('Products Operations', false, error.message);
    
    // Cleanup if needed
    await supabase.from('products').delete().eq('id', testProductId);
  }
  
  console.log('');
}

// ============================================================================
// TEST 5: PAGES (Create, Read, Update, Delete)
// ============================================================================
async function testPages() {
  console.log('📄 Testing PAGES table...');
  
  let testPageId = null;
  
  try {
    // CREATE: Insert new page
    const newPage = {
      slug: `test-page-${Date.now()}`,
      title: 'Test Page',
      content: { blocks: [{ type: 'paragraph', text: 'Test content' }] },
      published: true
    };
    
    const { data: createData, error: createError } = await supabase
      .from('pages')
      .insert(newPage)
      .select()
      .single();
    
    logTest('Pages CREATE', !createError && createData, createError?.message);
    
    if (createData) {
      testPageId = createData.id;
      
      // READ: Get the created page
      const { data: readData, error: readError } = await supabase
        .from('pages')
        .select('*')
        .eq('id', testPageId)
        .single();
      
      logTest('Pages READ', !readError && readData, readError?.message);
      
      // UPDATE: Update the page
      const { error: updateError } = await supabase
        .from('pages')
        .update({
          title: `Updated Page ${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', testPageId);
      
      logTest('Pages UPDATE', !updateError, updateError?.message);
      
      // DELETE: Delete the test page
      const { error: deleteError } = await supabase
        .from('pages')
        .delete()
        .eq('id', testPageId);
      
      logTest('Pages DELETE', !deleteError, deleteError?.message);
    }
  } catch (error) {
    logTest('Pages Operations', false, error.message);
    
    // Cleanup if needed
    if (testPageId) {
      await supabase.from('pages').delete().eq('id', testPageId);
    }
  }
  
  console.log('');
}

// ============================================================================
// TEST 6: STORAGE (List buckets, Upload, Download, Delete)
// ============================================================================
async function testStorage() {
  console.log('📦 Testing STORAGE operations...');
  
  const testFileName = `test-${Date.now()}.txt`;
  const testContent = 'This is a test file for storage CRUD operations.';
  
  try {
    // READ: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    logTest('Storage List Buckets', !bucketsError && buckets, bucketsError?.message);
    
    const mediaBucket = buckets?.find(b => b.name === 'media');
    logTest('Media Bucket Exists', !!mediaBucket);
    
    if (mediaBucket) {
      // CREATE: Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(testFileName, testContent, {
          contentType: 'text/plain',
          upsert: false
        });
      
      logTest('Storage CREATE (Upload)', !uploadError && uploadData, uploadError?.message);
      
      if (uploadData) {
        // READ: Get file URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(testFileName);
        
        logTest('Storage READ (Get URL)', !!urlData?.publicUrl);
        
        // READ: Download file
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('media')
          .download(testFileName);
        
        logTest('Storage READ (Download)', !downloadError && downloadData, downloadError?.message);
        
        if (downloadData) {
          const text = await downloadData.text();
          logTest('Storage READ Verification', text === testContent);
        }
        
        // DELETE: Delete file
        const { error: deleteError } = await supabase.storage
          .from('media')
          .remove([testFileName]);
        
        logTest('Storage DELETE', !deleteError, deleteError?.message);
      }
    }
  } catch (error) {
    logTest('Storage Operations', false, error.message);
  }
  
  console.log('');
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
  console.log('='.repeat(70));
  console.log('🚀 Starting Comprehensive CRUD Tests');
  console.log('='.repeat(70) + '\n');
  
  await testSettings();
  await testHomeContent();
  await testTestimonials();
  await testProducts();
  await testPages();
  await testStorage();
  
  // Final Report
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(70) + '\n');
  
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}\n`);
  
  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   - ${t.name}: ${t.message || 'Unknown error'}`));
    console.log('');
  }
  
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%\n`);
  
  console.log('='.repeat(70) + '\n');
  
  if (testResults.failed === 0) {
    console.log('🎉 All CRUD operations are working correctly!');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});
