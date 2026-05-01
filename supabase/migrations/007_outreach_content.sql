-- Outreach page content (photo titles, editable from admin)
-- Drop if partially created with wrong structure
DROP TABLE IF EXISTS outreach_content;

CREATE TABLE outreach_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  photo_titles JSONB NOT NULL DEFAULT '{
    "trailer": "Community Outreach",
    "outreach": "Cal Trans - Litter Pickup",
    "prayer": "12 Step - Self Help",
    "hug": "Bible Study",
    "community": "Community"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure updated_at trigger function exists (may already exist from other migrations)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_outreach_content_updated_at ON outreach_content;
CREATE TRIGGER update_outreach_content_updated_at
  BEFORE UPDATE ON outreach_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE outreach_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Outreach content is viewable by everyone" ON outreach_content;
CREATE POLICY "Outreach content is viewable by everyone"
  ON outreach_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Outreach content is editable by authenticated users" ON outreach_content;
CREATE POLICY "Outreach content is editable by authenticated users"
  ON outreach_content FOR ALL USING (auth.role() = 'authenticated');

-- Seed default row
INSERT INTO outreach_content (id, photo_titles)
VALUES ('default', '{
  "trailer": "Community Outreach",
  "outreach": "Cal Trans - Litter Pickup",
  "prayer": "12 Step - Self Help",
  "hug": "Bible Study",
  "community": "Community"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
