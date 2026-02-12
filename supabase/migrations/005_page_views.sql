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
