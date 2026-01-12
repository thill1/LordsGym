// Migration utilities to move data from localStorage to Supabase
import { supabase, isSupabaseConfigured } from './supabase';
import { SiteSettings, HomePageContent, Product, Testimonial } from '../types';

/**
 * Migrate settings from localStorage to Supabase
 */
export const migrateSettings = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping migration');
    return;
  }

  try {
    const saved = localStorage.getItem('site_settings');
    if (!saved) return;

    const settings: SiteSettings = JSON.parse(saved);
    
    // Check if settings already exist in Supabase
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    const settingsData = {
      site_name: settings.siteName,
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone,
      address: settings.address,
      google_analytics_id: settings.googleAnalyticsId || null,
      announcement_bar: settings.announcementBar,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing
      await supabase
        .from('settings')
        .update(settingsData)
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase
        .from('settings')
        .insert({ ...settingsData, id: 'default' });
    }
  } catch (error) {
    console.error('Error migrating settings:', error);
  }
};

/**
 * Migrate home content from localStorage to Supabase
 */
export const migrateHomeContent = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping migration');
    return;
  }

  try {
    const saved = localStorage.getItem('home_content_v2');
    if (!saved) return;

    const content: HomePageContent = JSON.parse(saved);
    
    const { data: existing } = await supabase
      .from('home_content')
      .select('id')
      .limit(1)
      .single();

    const contentData = {
      hero: content.hero,
      values: content.values,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      await supabase
        .from('home_content')
        .update(contentData)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('home_content')
        .insert({ ...contentData, id: 'default' });
    }
  } catch (error) {
    console.error('Error migrating home content:', error);
  }
};

/**
 * Migrate products from localStorage to Supabase
 */
export const migrateProducts = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping migration');
    return;
  }

  try {
    const saved = localStorage.getItem('shop_products');
    if (!saved) return;

    const products: Product[] = JSON.parse(saved);
    
    // Clear existing products (optional - you may want to merge instead)
    // await supabase.from('products').delete().neq('id', '');

    const productsData = products.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      description: null,
      inventory: null,
      variants: null,
      featured: false,
      updated_at: new Date().toISOString()
    }));

    // Upsert products
    for (const product of productsData) {
      await supabase
        .from('products')
        .upsert(product, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error migrating products:', error);
  }
};

/**
 * Migrate testimonials from localStorage to Supabase
 */
export const migrateTestimonials = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping migration');
    return;
  }

  try {
    const saved = localStorage.getItem('site_testimonials');
    if (!saved) return;

    const testimonials: Testimonial[] = JSON.parse(saved);
    
    const testimonialsData = testimonials.map(testimonial => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      quote: testimonial.quote,
      updated_at: new Date().toISOString()
    }));

    // Upsert testimonials
    for (const testimonial of testimonialsData) {
      await supabase
        .from('testimonials')
        .upsert(testimonial, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error migrating testimonials:', error);
  }
};

/**
 * Run all migrations
 */
export const runMigrations = async (): Promise<void> => {
  console.log('Starting data migration from localStorage to Supabase...');
  
  await Promise.all([
    migrateSettings(),
    migrateHomeContent(),
    migrateProducts(),
    migrateTestimonials()
  ]);
  
  console.log('Migration complete!');
};
