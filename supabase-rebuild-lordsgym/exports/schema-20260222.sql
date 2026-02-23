-- Lords Gym Schema Backup (generated 2026-02-22T23:59:01.297Z)
-- Run in order. Source: LordsGym/supabase/migrations/


-- === 000_ensure_uuid_function.sql ===

-- Ensure uuid_generate_v4() is available in public schema for migrations.
-- Supabase installs uuid-ossp in extensions schema; provide a public wrapper.
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid AS $$
  SELECT gen_random_uuid();
$$ LANGUAGE sql;


-- === 001_initial_schema.sql ===

-- Lord's Gym Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  google_analytics_id TEXT,
  announcement_bar JSONB NOT NULL DEFAULT '{"enabled": false, "message": "", "link": null}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home content table
CREATE TABLE IF NOT EXISTS home_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero JSONB NOT NULL,
  values JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  inventory JSONB,
  variants JSONB,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  quote TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_image TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  folder TEXT,
  tags TEXT[],
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instructors table
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar recurring patterns table
CREATE TABLE IF NOT EXISTS calendar_recurring_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  interval INTEGER NOT NULL DEFAULT 1,
  days_of_week INTEGER[], -- For weekly patterns: [1,3,5] = Mon, Wed, Fri
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  class_type TEXT NOT NULL, -- 'strength', 'cardio', 'recovery', 'community'
  capacity INTEGER,
  recurring_pattern_id UUID REFERENCES calendar_recurring_patterns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar bookings table
CREATE TABLE IF NOT EXISTS calendar_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'waitlist'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_class_type ON calendar_events(class_type);
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_event_id ON calendar_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_user_id ON calendar_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY;

-- Settings: Public read, authenticated write
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings are editable by authenticated users" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Home content: Public read, authenticated write
CREATE POLICY "Home content is viewable by everyone" ON home_content FOR SELECT USING (true);
CREATE POLICY "Home content is editable by authenticated users" ON home_content FOR ALL USING (auth.role() = 'authenticated');

-- Products: Public read, authenticated write
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials: Public read, authenticated write
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Testimonials are editable by authenticated users" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Pages: Public read for published, authenticated write
CREATE POLICY "Published pages are viewable by everyone" ON pages FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Pages are editable by authenticated users" ON pages FOR ALL USING (auth.role() = 'authenticated');

-- Media: Public read, authenticated write
CREATE POLICY "Media is viewable by everyone" ON media FOR SELECT USING (true);
CREATE POLICY "Media is editable by authenticated users" ON media FOR ALL USING (auth.role() = 'authenticated');

-- Instructors: Public read, authenticated write
CREATE POLICY "Instructors are viewable by everyone" ON instructors FOR SELECT USING (true);
CREATE POLICY "Instructors are editable by authenticated users" ON instructors FOR ALL USING (auth.role() = 'authenticated');

-- Calendar events: Public read, authenticated write
CREATE POLICY "Calendar events are viewable by everyone" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Calendar events are editable by authenticated users" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- Calendar recurring patterns: Authenticated only
CREATE POLICY "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Recurring patterns are editable by authenticated users" ON calendar_recurring_patterns FOR ALL USING (auth.role() = 'authenticated');

-- Calendar bookings: Users can see their own, admins can oversee all
CREATE POLICY "Users can view their own bookings" ON calendar_bookings FOR SELECT USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);
CREATE POLICY "Authenticated users can create bookings" ON calendar_bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own bookings" ON calendar_bookings FOR UPDATE USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);
CREATE POLICY "Users can delete their own bookings" ON calendar_bookings FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON home_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_recurring_patterns_updated_at BEFORE UPDATE ON calendar_recurring_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_bookings_updated_at BEFORE UPDATE ON calendar_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (id, site_name, contact_email, contact_phone, address, announcement_bar)
VALUES (
  'default',
  'Lord''s Gym',
  'lordsgymoutreach@gmail.com',
  '530-537-2105',
  '258 Elm Ave, Auburn, CA 95603',
  '{"enabled": false, "message": "Join now and get your first month for $10!", "link": "/membership"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert default home content
INSERT INTO home_content (id, hero, values)
VALUES (
  'default',
  '{"headline": "TRAIN WITH PURPOSE.\\nLIVE WITH FAITH.", "subheadline": "Our mission is to bring strength and healing to our community through fitness, Christ and service.", "ctaText": "Join Now", "backgroundImage": ""}'::jsonb,
  '{"stat1": "24/7", "label1": "Access", "stat2": "100%", "label2": "Commitment", "stat3": "1", "label3": "Community"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Recurrence materialization compatibility fields
ALTER TABLE calendar_recurring_patterns
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Recurring Event',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS class_type TEXT NOT NULL DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS start_time_local TIME NOT NULL DEFAULT TIME '09:00:00',
  ADD COLUMN IF NOT EXISTS end_time_local TIME NOT NULL DEFAULT TIME '10:00:00',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS generation_horizon_days INTEGER NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS last_materialized_at TIMESTAMPTZ;

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS occurrence_date DATE,
  ADD COLUMN IF NOT EXISTS is_recurring_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_recurring_preserved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_series_id UUID;

CREATE INDEX IF NOT EXISTS idx_calendar_events_occurrence_date ON calendar_events(occurrence_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_pattern_id_start_time ON calendar_events(recurring_pattern_id, start_time);


-- === 002_recurring_exceptions.sql ===

-- Migration: Add recurring event exceptions table
-- This allows skipping specific dates in recurring event patterns

-- Recurring event exceptions table
CREATE TABLE IF NOT EXISTS calendar_recurring_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recurring_pattern_id UUID NOT NULL REFERENCES calendar_recurring_patterns(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recurring_pattern_id, exception_date)
);

-- Activity logs table for admin actions
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT NOT NULL, -- 'product', 'page', 'event', 'user', etc.
  entity_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_exceptions_pattern_id ON calendar_recurring_exceptions(recurring_pattern_id);
CREATE INDEX IF NOT EXISTS idx_recurring_exceptions_date ON calendar_recurring_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);

-- Enable RLS
ALTER TABLE calendar_recurring_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exceptions
CREATE POLICY "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Exceptions are editable by authenticated users" ON calendar_recurring_exceptions FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for activity logs
CREATE POLICY "Activity logs are viewable by authenticated users" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Activity logs are insertable by authenticated users" ON activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- === 003_complete_schema.sql ===

-- Complete Database Schema for Lord's Gym
-- This migration consolidates and extends the schema with all required tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE CONTENT TABLES
-- ============================================================================

-- Settings table (site-wide configuration)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  google_analytics_id TEXT,
  announcement_bar JSONB NOT NULL DEFAULT '{"enabled": false, "message": "", "link": null}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home content table
CREATE TABLE IF NOT EXISTS home_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero JSONB NOT NULL,
  values JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  inventory JSONB,
  variants JSONB,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  quote TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table (CMS pages)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_image TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MEDIA & ASSETS
-- ============================================================================

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  folder TEXT,
  tags TEXT[],
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CALENDAR & BOOKINGS
-- ============================================================================

-- Instructors table
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar recurring patterns table
CREATE TABLE IF NOT EXISTS calendar_recurring_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  interval INTEGER NOT NULL DEFAULT 1,
  days_of_week INTEGER[], -- For weekly patterns: [1,3,5] = Mon, Wed, Fri
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  class_type TEXT NOT NULL, -- 'strength', 'cardio', 'recovery', 'community'
  capacity INTEGER,
  recurring_pattern_id UUID REFERENCES calendar_recurring_patterns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar recurring exceptions table
CREATE TABLE IF NOT EXISTS calendar_recurring_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recurring_pattern_id UUID NOT NULL REFERENCES calendar_recurring_patterns(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recurring_pattern_id, exception_date)
);

-- Calendar bookings table
CREATE TABLE IF NOT EXISTS calendar_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'waitlist'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================================================
-- ADMIN & VERSION CONTROL
-- ============================================================================

-- Page versions table (for version history)
CREATE TABLE IF NOT EXISTS page_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_image TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT NOT NULL, -- 'product', 'page', 'event', 'user', etc.
  entity_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEO & SCHEMA MARKUP
-- ============================================================================

-- SEO settings table (site-wide SEO defaults)
CREATE TABLE IF NOT EXISTS seo_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  default_meta_title TEXT,
  default_meta_description TEXT,
  default_og_image TEXT,
  twitter_handle TEXT,
  facebook_app_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema markup table (for storing schema.org JSON-LD)
CREATE TABLE IF NOT EXISTS schema_markup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT, -- NULL for site-wide schema
  schema_type TEXT NOT NULL, -- 'Organization', 'LocalBusiness', 'Event', 'Product', 'Article'
  schema_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, schema_type)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_class_type ON calendar_events(class_type);
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_event_id ON calendar_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_user_id ON calendar_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);
CREATE INDEX IF NOT EXISTS idx_recurring_exceptions_pattern_id ON calendar_recurring_exceptions(recurring_pattern_id);
CREATE INDEX IF NOT EXISTS idx_recurring_exceptions_date ON calendar_recurring_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_created_at ON page_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_schema_markup_page_slug ON schema_markup(page_slug);
CREATE INDEX IF NOT EXISTS idx_schema_markup_active ON schema_markup(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_recurring_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_markup ENABLE ROW LEVEL SECURITY;

-- Settings: Public read, authenticated write
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Settings are editable by authenticated users" ON settings;
CREATE POLICY "Settings are editable by authenticated users" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Home content: Public read, authenticated write
DROP POLICY IF EXISTS "Home content is viewable by everyone" ON home_content;
CREATE POLICY "Home content is viewable by everyone" ON home_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Home content is editable by authenticated users" ON home_content;
CREATE POLICY "Home content is editable by authenticated users" ON home_content FOR ALL USING (auth.role() = 'authenticated');

-- Products: Public read, authenticated write
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Products are editable by authenticated users" ON products;
CREATE POLICY "Products are editable by authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials: Public read, authenticated write
DROP POLICY IF EXISTS "Testimonials are viewable by everyone" ON testimonials;
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Testimonials are editable by authenticated users" ON testimonials;
CREATE POLICY "Testimonials are editable by authenticated users" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Pages: Public read for published, authenticated write
DROP POLICY IF EXISTS "Published pages are viewable by everyone" ON pages;
CREATE POLICY "Published pages are viewable by everyone" ON pages FOR SELECT USING (published = true OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Pages are editable by authenticated users" ON pages;
CREATE POLICY "Pages are editable by authenticated users" ON pages FOR ALL USING (auth.role() = 'authenticated');

-- Media: Public read, authenticated write
DROP POLICY IF EXISTS "Media is viewable by everyone" ON media;
CREATE POLICY "Media is viewable by everyone" ON media FOR SELECT USING (true);
DROP POLICY IF EXISTS "Media is editable by authenticated users" ON media;
CREATE POLICY "Media is editable by authenticated users" ON media FOR ALL USING (auth.role() = 'authenticated');

-- Instructors: Public read, authenticated write
DROP POLICY IF EXISTS "Instructors are viewable by everyone" ON instructors;
CREATE POLICY "Instructors are viewable by everyone" ON instructors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Instructors are editable by authenticated users" ON instructors;
CREATE POLICY "Instructors are editable by authenticated users" ON instructors FOR ALL USING (auth.role() = 'authenticated');

-- Calendar events: Public read, authenticated write
DROP POLICY IF EXISTS "Calendar events are viewable by everyone" ON calendar_events;
CREATE POLICY "Calendar events are viewable by everyone" ON calendar_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Calendar events are editable by authenticated users" ON calendar_events;
CREATE POLICY "Calendar events are editable by authenticated users" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- Calendar recurring patterns: Authenticated only
DROP POLICY IF EXISTS "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Recurring patterns are editable by authenticated users" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are editable by authenticated users" ON calendar_recurring_patterns FOR ALL USING (auth.role() = 'authenticated');

-- Calendar recurring exceptions: Authenticated only
DROP POLICY IF EXISTS "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions;
CREATE POLICY "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Exceptions are editable by authenticated users" ON calendar_recurring_exceptions;
CREATE POLICY "Exceptions are editable by authenticated users" ON calendar_recurring_exceptions FOR ALL USING (auth.role() = 'authenticated');

-- Calendar bookings: Users can see their own, authenticated can create
DROP POLICY IF EXISTS "Users can view their own bookings" ON calendar_bookings;
CREATE POLICY "Users can view their own bookings" ON calendar_bookings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON calendar_bookings;
CREATE POLICY "Authenticated users can create bookings" ON calendar_bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update their own bookings" ON calendar_bookings;
CREATE POLICY "Users can update their own bookings" ON calendar_bookings FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own bookings" ON calendar_bookings;
CREATE POLICY "Users can delete their own bookings" ON calendar_bookings FOR DELETE USING (auth.uid() = user_id);

-- Page versions: Authenticated read/write
DROP POLICY IF EXISTS "Page versions are viewable by authenticated users" ON page_versions;
CREATE POLICY "Page versions are viewable by authenticated users" ON page_versions FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Page versions are editable by authenticated users" ON page_versions;
CREATE POLICY "Page versions are editable by authenticated users" ON page_versions FOR ALL USING (auth.role() = 'authenticated');

-- Activity logs: Authenticated read/write
DROP POLICY IF EXISTS "Activity logs are viewable by authenticated users" ON activity_logs;
CREATE POLICY "Activity logs are viewable by authenticated users" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Activity logs are insertable by authenticated users" ON activity_logs;
CREATE POLICY "Activity logs are insertable by authenticated users" ON activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SEO settings: Public read, authenticated write
DROP POLICY IF EXISTS "SEO settings are viewable by everyone" ON seo_settings;
CREATE POLICY "SEO settings are viewable by everyone" ON seo_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "SEO settings are editable by authenticated users" ON seo_settings;
CREATE POLICY "SEO settings are editable by authenticated users" ON seo_settings FOR ALL USING (auth.role() = 'authenticated');

-- Schema markup: Public read, authenticated write
DROP POLICY IF EXISTS "Schema markup is viewable by everyone" ON schema_markup;
CREATE POLICY "Schema markup is viewable by everyone" ON schema_markup FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Schema markup is editable by authenticated users" ON schema_markup;
CREATE POLICY "Schema markup is editable by authenticated users" ON schema_markup FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_home_content_updated_at ON home_content;
CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON home_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instructors_updated_at ON instructors;
CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_recurring_patterns_updated_at ON calendar_recurring_patterns;
CREATE TRIGGER update_calendar_recurring_patterns_updated_at BEFORE UPDATE ON calendar_recurring_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_bookings_updated_at ON calendar_bookings;
CREATE TRIGGER update_calendar_bookings_updated_at BEFORE UPDATE ON calendar_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON seo_settings;
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schema_markup_updated_at ON schema_markup;
CREATE TRIGGER update_schema_markup_updated_at BEFORE UPDATE ON schema_markup FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default settings
INSERT INTO settings (id, site_name, contact_email, contact_phone, address, announcement_bar)
VALUES (
  'default',
  'Lord''s Gym',
  'lordsgymoutreach@gmail.com',
  '530-537-2105',
  '258 Elm Ave, Auburn, CA 95603',
  '{"enabled": false, "message": "Join now and get your first month for $10!", "link": "/membership"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert default home content
INSERT INTO home_content (id, hero, values)
VALUES (
  'default',
  '{"headline": "TRAIN WITH PURPOSE.\\nLIVE WITH FAITH.", "subheadline": "Our mission is to bring strength and healing to our community through fitness, Christ and service.", "ctaText": "Join Now", "backgroundImage": ""}'::jsonb,
  '{"stat1": "24/7", "label1": "Access", "stat2": "100%", "label2": "Commitment", "stat3": "1", "label3": "Community"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert default SEO settings
INSERT INTO seo_settings (id, default_meta_title, default_meta_description)
VALUES (
  'default',
  'Lord''s Gym - Train with Purpose, Live with Faith',
  'Our mission is to bring strength and healing to our community through fitness, Christ and service.'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CALENDAR RECURRENCE MATERIALIZATION COMPATIBILITY
-- ============================================================================

ALTER TABLE calendar_recurring_patterns
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Recurring Event',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS class_type TEXT NOT NULL DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS start_time_local TIME NOT NULL DEFAULT TIME '09:00:00',
  ADD COLUMN IF NOT EXISTS end_time_local TIME NOT NULL DEFAULT TIME '10:00:00',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS generation_horizon_days INTEGER NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS last_materialized_at TIMESTAMPTZ;

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_pattern_type_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_pattern_type_check
    CHECK (pattern_type IN ('daily', 'weekly', 'monthly'));

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_interval_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_interval_check
    CHECK (interval >= 1);

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_generation_horizon_days_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_generation_horizon_days_check
    CHECK (generation_horizon_days >= 1);

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_time_window_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_time_window_check
    CHECK (end_time_local > start_time_local);

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS occurrence_date DATE,
  ADD COLUMN IF NOT EXISTS is_recurring_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_recurring_preserved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_series_id UUID;

UPDATE calendar_events
SET
  occurrence_date = COALESCE(occurrence_date, (start_time AT TIME ZONE 'UTC')::DATE),
  is_recurring_generated = CASE WHEN recurring_pattern_id IS NOT NULL THEN true ELSE is_recurring_generated END,
  recurring_series_id = COALESCE(recurring_series_id, recurring_pattern_id)
WHERE occurrence_date IS NULL
   OR recurring_pattern_id IS NOT NULL
   OR recurring_series_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_recurring_patterns_active ON calendar_recurring_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_patterns_starts_on ON calendar_recurring_patterns(starts_on);
CREATE INDEX IF NOT EXISTS idx_calendar_events_occurrence_date ON calendar_events(occurrence_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_pattern_id_start_time ON calendar_events(recurring_pattern_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_series_id ON calendar_events(recurring_series_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_generated ON calendar_events(is_recurring_generated);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_calendar_events_generated_occurrence
  ON calendar_events(recurring_pattern_id, occurrence_date)
  WHERE recurring_pattern_id IS NOT NULL AND is_recurring_generated = true;

-- Calendar bookings policy: user self-service + admin oversight.
DROP POLICY IF EXISTS "Users can view their own bookings" ON calendar_bookings;
CREATE POLICY "Users can view their own bookings" ON calendar_bookings
FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);

DROP POLICY IF EXISTS "Users can update their own bookings" ON calendar_bookings;
CREATE POLICY "Users can update their own bookings" ON calendar_bookings
FOR UPDATE
USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);


-- === 004_fix_testimonials_sequence.sql ===

-- Fix testimonials id sequence if it falls out of sync (e.g. after manual inserts or imports)
-- Run this in Supabase SQL Editor if you see "duplicate key value violates unique constraint" on testimonials insert

SELECT setval(
  pg_get_serial_sequence('testimonials', 'id'),
  coalesce((SELECT max(id) FROM testimonials), 0) + 1,
  false
);


-- === 005_page_views.sql ===

-- Migration: Add page_views table for self-hosted website traffic analytics
-- Tracks page views like Google Analytics (path, referrer, session, timestamp)

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert (public visitors record their page views)
CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);

-- Only authenticated users (admins) can read analytics
CREATE POLICY "Authenticated users can view page views" ON page_views FOR SELECT USING (auth.role() = 'authenticated');


-- === 006_popup_modals.sql ===

-- Add popup_modals to settings for admin-controlled, page-specific popups
-- Run this after 003_complete_schema.sql (or after your existing settings table exists)

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS popup_modals JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Ensure existing default row has empty array if column was just added
UPDATE settings
SET popup_modals = COALESCE(popup_modals, '[]'::jsonb)
WHERE id = 'default' AND (popup_modals IS NULL OR popup_modals = 'null'::jsonb);


-- === 20250207_stripe_integration.sql ===

-- Stripe Integration Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memberships table: Tracks active memberships for users
CREATE TABLE IF NOT EXISTS memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_type VARCHAR(50) NOT NULL CHECK (membership_type IN ('day-pass', 'monthly-basic', 'monthly-pro', 'annual')),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Payment intents tracking: Records checkout attempts and status
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    membership_type VARCHAR(50) NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE,
    amount INTEGER NOT NULL, -- in cents
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own membership" ON memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment intents" ON payment_intents
    FOR SELECT USING (auth.uid() = user_id);

-- Service role policies for webhook functions (bypass RLS)
CREATE POLICY "Service role can manage memberships" ON memberships
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage payment intents" ON payment_intents
    FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_stripe_subscription ON memberships(stripe_subscription_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_payment_intents_user ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_session ON payment_intents(stripe_session_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View: Active memberships with user info
CREATE OR REPLACE VIEW active_memberships_view AS
SELECT 
    m.id,
    m.user_id,
    u.email as user_email,
    m.membership_type,
    m.status,
    m.current_period_start,
    m.current_period_end,
    m.stripe_subscription_id,
    CASE 
        WHEN m.current_period_end < NOW() THEN 'expired'
        WHEN m.current_period_end < NOW() + INTERVAL '7 days' THEN 'expires_soon'
        ELSE 'active'
    END as renewal_status
FROM memberships m
JOIN auth.users u ON m.user_id = u.id
WHERE m.status = 'active';

-- Function: Check if user has active membership
CREATE OR REPLACE FUNCTION has_active_membership(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships 
        WHERE user_id = p_user_id 
        AND status = 'active' 
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user membership details
CREATE OR REPLACE FUNCTION get_user_membership(p_user_id UUID)
RETURNS TABLE (
    membership_type VARCHAR,
    status VARCHAR,
    current_period_end TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.membership_type,
        m.status,
        m.current_period_end,
        EXTRACT(DAY FROM (m.current_period_end - NOW()))::INTEGER as days_remaining
    FROM memberships m
    WHERE m.user_id = p_user_id
    AND m.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_active_membership(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_membership(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_membership(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_membership(UUID) TO anon;


-- === 20250209_contact_submissions.sql ===

-- Contact form submissions for marketing and follow-up
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Allow service role (edge function) to insert, no public read/write
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by edge function)
CREATE POLICY "Service role full access" ON contact_submissions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can read (for follow-up in admin)
CREATE POLICY "Admins can read contact submissions" ON contact_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Index for recent submissions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions (created_at DESC);


-- === 20250213_calendar_public_read.sql ===

-- Allow public (anon) to read recurring patterns and exceptions for calendar display.
-- The calendar page is public; visitors need pattern data to see recurring events.

DROP POLICY IF EXISTS "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions;
CREATE POLICY "Exceptions are viewable by everyone" ON calendar_recurring_exceptions FOR SELECT USING (true);


-- === 20260218120000_recurrence_safety_constraints.sql ===

-- Safety constraints for recurrence materialization and regeneration.
-- Ensures recurring metadata stays consistent as events are regenerated.

UPDATE calendar_events
SET occurrence_date = (start_time AT TIME ZONE 'UTC')::date
WHERE recurring_pattern_id IS NOT NULL
  AND occurrence_date IS NULL;

UPDATE calendar_events
SET recurring_series_id = recurring_pattern_id
WHERE recurring_pattern_id IS NOT NULL
  AND recurring_series_id IS NULL;

CREATE OR REPLACE FUNCTION set_calendar_event_recurrence_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recurring_pattern_id IS NOT NULL AND NEW.occurrence_date IS NULL THEN
    NEW.occurrence_date := (NEW.start_time AT TIME ZONE 'UTC')::date;
  END IF;

  IF NEW.recurring_pattern_id IS NOT NULL AND NEW.recurring_series_id IS NULL THEN
    NEW.recurring_series_id := NEW.recurring_pattern_id;
  END IF;

  IF NEW.is_recurring_generated IS NULL THEN
    NEW.is_recurring_generated := false;
  END IF;

  IF NEW.is_recurring_preserved IS NULL THEN
    NEW.is_recurring_preserved := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_calendar_event_recurrence_defaults_trigger ON calendar_events;
CREATE TRIGGER set_calendar_event_recurrence_defaults_trigger
BEFORE INSERT OR UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION set_calendar_event_recurrence_defaults();

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_days_of_week_range_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_days_of_week_range_check
  CHECK (
    days_of_week IS NULL
    OR days_of_week <@ ARRAY[0,1,2,3,4,5,6]::INTEGER[]
  );

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_end_date_after_start_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_end_date_after_start_check
  CHECK (end_date IS NULL OR end_date::date >= starts_on);

ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_generated_requires_pattern_check;
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_generated_requires_pattern_check
  CHECK (
    is_recurring_generated = false
    OR recurring_pattern_id IS NOT NULL
  );

ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_preserved_requires_series_check;
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_preserved_requires_series_check
  CHECK (
    is_recurring_preserved = false
    OR recurring_series_id IS NOT NULL
  );

ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_pattern_requires_occurrence_date_check;
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_pattern_requires_occurrence_date_check
  CHECK (
    recurring_pattern_id IS NULL
    OR occurrence_date IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_calendar_events_pattern_occurrence_date
  ON calendar_events(recurring_pattern_id, occurrence_date);

CREATE INDEX IF NOT EXISTS idx_calendar_bookings_event_status
  ON calendar_bookings(event_id, status);


-- === 20260218_recurrence_materialization.sql ===

-- Recurrence materialization schema for calendar series synchronization.
-- Adds series metadata needed to generate concrete events and track safe regeneration.

ALTER TABLE calendar_recurring_patterns
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Recurring Event',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS class_type TEXT NOT NULL DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS start_time_local TIME NOT NULL DEFAULT TIME '09:00:00',
  ADD COLUMN IF NOT EXISTS end_time_local TIME NOT NULL DEFAULT TIME '10:00:00',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS generation_horizon_days INTEGER NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS last_materialized_at TIMESTAMPTZ;

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_pattern_type_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_pattern_type_check
    CHECK (pattern_type IN ('daily', 'weekly', 'monthly'));

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_interval_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_interval_check
    CHECK (interval >= 1);

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_generation_horizon_days_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_generation_horizon_days_check
    CHECK (generation_horizon_days >= 1);

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_time_window_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_time_window_check
    CHECK (end_time_local > start_time_local);

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS occurrence_date DATE,
  ADD COLUMN IF NOT EXISTS is_recurring_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_recurring_preserved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_series_id UUID;

UPDATE calendar_events
SET
  occurrence_date = COALESCE(occurrence_date, (start_time AT TIME ZONE 'UTC')::DATE),
  is_recurring_generated = CASE WHEN recurring_pattern_id IS NOT NULL THEN true ELSE is_recurring_generated END,
  recurring_series_id = COALESCE(recurring_series_id, recurring_pattern_id)
WHERE occurrence_date IS NULL
   OR recurring_pattern_id IS NOT NULL
   OR recurring_series_id IS NULL;

UPDATE calendar_recurring_patterns p
SET
  title = COALESCE(p.title, seed.title, 'Recurring Event'),
  description = COALESCE(p.description, seed.description),
  class_type = COALESCE(p.class_type, seed.class_type, 'community'),
  instructor_id = COALESCE(p.instructor_id, seed.instructor_id),
  capacity = COALESCE(p.capacity, seed.capacity),
  starts_on = COALESCE(p.starts_on, seed.starts_on, CURRENT_DATE),
  start_time_local = COALESCE(p.start_time_local, seed.start_time_local, TIME '09:00:00'),
  end_time_local = COALESCE(p.end_time_local, seed.end_time_local, TIME '10:00:00')
FROM (
  SELECT DISTINCT ON (e.recurring_pattern_id)
    e.recurring_pattern_id AS pattern_id,
    e.title,
    e.description,
    e.class_type,
    e.instructor_id,
    e.capacity,
    (e.start_time AT TIME ZONE 'UTC')::DATE AS starts_on,
    (e.start_time AT TIME ZONE 'UTC')::TIME AS start_time_local,
    (e.end_time AT TIME ZONE 'UTC')::TIME AS end_time_local
  FROM calendar_events e
  WHERE e.recurring_pattern_id IS NOT NULL
  ORDER BY e.recurring_pattern_id, e.start_time ASC
) AS seed
WHERE p.id = seed.pattern_id;

CREATE INDEX IF NOT EXISTS idx_recurring_patterns_active ON calendar_recurring_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_patterns_starts_on ON calendar_recurring_patterns(starts_on);
CREATE INDEX IF NOT EXISTS idx_calendar_events_occurrence_date ON calendar_events(occurrence_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_pattern_id_start_time ON calendar_events(recurring_pattern_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_series_id ON calendar_events(recurring_series_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_generated ON calendar_events(is_recurring_generated);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_calendar_events_generated_occurrence
  ON calendar_events(recurring_pattern_id, occurrence_date)
  WHERE recurring_pattern_id IS NOT NULL AND is_recurring_generated = true;

-- Enable admin booking oversight while preserving member self-service.
DROP POLICY IF EXISTS "Users can view their own bookings" ON calendar_bookings;
CREATE POLICY "Users can view their own bookings" ON calendar_bookings
FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);

DROP POLICY IF EXISTS "Users can update their own bookings" ON calendar_bookings;
CREATE POLICY "Users can update their own bookings" ON calendar_bookings
FOR UPDATE
USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);


-- === 20260219000000_calendar_recurring_public.sql ===

-- Calendar recurring fix: RPC + RLS for public display.
-- 1. RPC bypasses RLS so anon (e.g. mobile Safari) get recurring pattern data.
-- 2. RLS policies allow public read on recurring patterns and exceptions.

-- RPC: returns events with recurring_pattern for all users
CREATE OR REPLACE FUNCTION public.get_calendar_events_for_display()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      (row_to_json(t)::jsonb) ORDER BY t.start_time
    ),
    '[]'::jsonb
  )
  INTO result
  FROM (
    SELECT
      e.id,
      e.title,
      e.description,
      e.start_time,
      e.end_time,
      e.instructor_id,
      e.class_type,
      e.capacity,
      e.recurring_pattern_id,
      e.occurrence_date,
      COALESCE(e.is_recurring_generated, false) AS is_recurring_generated,
      COALESCE(e.is_recurring_preserved, false) AS is_recurring_preserved,
      e.recurring_series_id,
      (SELECT count(*)::int FROM calendar_bookings b WHERE b.event_id = e.id AND b.status = 'confirmed') AS booked_count,
      CASE
        WHEN p.id IS NOT NULL THEN jsonb_build_object(
          'id', p.id,
          'pattern_type', p.pattern_type,
          'interval', COALESCE(p.interval, 1),
          'days_of_week', p.days_of_week,
          'end_date', p.end_date
        )
        ELSE NULL
      END AS recurring_pattern
    FROM calendar_events e
    LEFT JOIN calendar_recurring_patterns p ON p.id = e.recurring_pattern_id
  ) t;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_calendar_events_for_display() TO anon;
GRANT EXECUTE ON FUNCTION public.get_calendar_events_for_display() TO authenticated;

COMMENT ON FUNCTION public.get_calendar_events_for_display() IS
  'Returns calendar events with recurring pattern data for public display. Bypasses RLS so anon visitors (e.g. mobile Safari) see recurring events.';

-- RLS: allow public read on recurring patterns and exceptions
DROP POLICY IF EXISTS "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns;
DROP POLICY IF EXISTS "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions;
DROP POLICY IF EXISTS "Exceptions are viewable by everyone" ON calendar_recurring_exceptions;
CREATE POLICY "Exceptions are viewable by everyone" ON calendar_recurring_exceptions FOR SELECT USING (true);


-- === 20260219010000_testimonials_google_source.sql ===

-- Add source and external_id to testimonials for Google Reviews import
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE INDEX IF NOT EXISTS idx_testimonials_external_id
  ON testimonials(external_id) WHERE external_id IS NOT NULL;


-- === 20260219020000_database_hardening.sql ===

-- Database hardening: RLS, indexes, constraints
-- Improves security, performance, and data integrity.

-- =============================================================================
-- 1. STRIPE RLS: Remove overly permissive policies
-- Service role bypasses RLS; these policies accidentally granted anon/auth full access.
-- =============================================================================
DROP POLICY IF EXISTS "Service role can manage memberships" ON memberships;
DROP POLICY IF EXISTS "Service role can manage payment_intents" ON payment_intents;
-- Result: Only service_role (via bypass) can INSERT/UPDATE/DELETE. Authenticated users retain SELECT on own rows only.

-- =============================================================================
-- 2. CALENDAR_BOOKINGS: Restrict INSERT to own user_id
-- Prevents users from creating bookings for other users.
-- =============================================================================
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON calendar_bookings;
CREATE POLICY "Users can create own bookings" ON calendar_bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 3. INDEXES: Instructor ID foreign keys (join performance)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_calendar_events_instructor_id
  ON calendar_events(instructor_id)
  WHERE instructor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_recurring_patterns_instructor_id
  ON calendar_recurring_patterns(instructor_id)
  WHERE instructor_id IS NOT NULL;

-- =============================================================================
-- 4. STRIPE INDEXES: Idempotent creation (safe migration reruns)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_stripe_subscription ON memberships(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_session ON payment_intents(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);

-- =============================================================================
-- 5. TESTIMONIALS: Prevent duplicate Google review imports
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_source_external_id
  ON testimonials(source, external_id)
  WHERE external_id IS NOT NULL;


-- === 20260220_products_image_coming_soon.sql ===

-- Add image_coming_soon column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_coming_soon BOOLEAN DEFAULT false;


-- === 20260221_products_coming_soon_image.sql ===

-- Add coming_soon_image column to products (optional custom image when image_coming_soon is true)
ALTER TABLE products ADD COLUMN IF NOT EXISTS coming_soon_image TEXT;
