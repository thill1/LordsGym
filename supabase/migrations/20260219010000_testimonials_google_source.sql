-- Add source and external_id to testimonials for Google Reviews import
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE INDEX IF NOT EXISTS idx_testimonials_external_id
  ON testimonials(external_id) WHERE external_id IS NOT NULL;
