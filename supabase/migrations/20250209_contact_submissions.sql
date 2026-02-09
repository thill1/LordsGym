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
