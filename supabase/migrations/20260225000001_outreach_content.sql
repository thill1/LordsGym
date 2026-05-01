-- Outreach page images (hero, photo grid, community). Admin-editable via Outreach Content Editor.
-- Parallel to home_content; images JSONB stores hero, trailer, outreach, prayer, hug, community URLs.

CREATE TABLE IF NOT EXISTS outreach_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  images JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE outreach_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Outreach content is viewable by everyone"
  ON outreach_content FOR SELECT USING (true);

CREATE POLICY "Outreach content is editable by authenticated users"
  ON outreach_content FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER update_outreach_content_updated_at
  BEFORE UPDATE ON outreach_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO outreach_content (id, images)
VALUES ('default', '{}')
ON CONFLICT (id) DO NOTHING;
