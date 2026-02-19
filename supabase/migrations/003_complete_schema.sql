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
