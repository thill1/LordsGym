#!/usr/bin/env node
/**
 * Seed the products table with the default store products (from constants).
 * Run with backup project .env.local: node scripts/seed-store-products.mjs
 * Idempotent: uses upsert so safe to run multiple times.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) return {};
  const env = {};
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const i = t.indexOf('=');
      if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  });
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exitCode = 1;
  process.exit(1);
}

const base = '/';
const getMerchImage = (filename) => `${base}media/merchandise/${filename}`;

const SEED_PRODUCTS = [
  { id: 'm1', title: "Lord's Cross Lifter Tee", price: 32, category: "Men's Apparel", image: getMerchImage('lords-cross-lifter-tee.png.jpg') },
  { id: 'm2', title: "Lord's Cross Carrier Hoodie", price: 55, category: "Men's Apparel", image: getMerchImage('lords-cross-carrier-hoodie.png.jpg') },
  { id: 'm3', title: "Lord's Squatting Cross Hoodie", price: 55, category: "Men's Apparel", image: getMerchImage('lords-squatting-cross-hoodie.png.jpg') },
  { id: 'm4', title: 'Son of Man Long Sleeve', price: 38, category: "Men's Apparel", image: getMerchImage('son-of-man-long-sleeve.png.jpg') },
  { id: 'm5', title: "Lord's Squatting Cross Tee", price: 32, category: "Men's Apparel", image: getMerchImage('lords-squatting-cross-tee.png.jpg') },
  { id: 'm6', title: "Lord's Cross Lifter Long Sleeve", price: 38, category: "Men's Apparel", image: getMerchImage('lords-cross-lifter-long-sleeve.png.jpg') },
  { id: 'm7', title: "Lord's Cross Barbell Hoodie", price: 55, category: "Men's Apparel", image: getMerchImage('lords-cross-barbell-hoodie.png.jpg') },
  { id: 'w1', title: 'Faith Over Fear Tee', price: 32, category: "Women's Apparel", image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80' },
  { id: 'a1', title: 'Scripture Wristbands (3-Pack)', price: 10, category: 'Accessories', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80' },
];

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log('Seeding products table with default store products...');
  const rows = SEED_PRODUCTS.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category,
    image: p.image,
    image_coming_soon: false,
    coming_soon_image: null,
    description: null,
    inventory: null,
    featured: false,
  }));

  const { data, error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
    return;
  }
  console.log(`Seeded ${rows.length} products.`);
}

main();
