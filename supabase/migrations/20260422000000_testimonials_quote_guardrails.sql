-- Harden testimonial data quality for production.
-- 1) Keep quote length bounded at 300 characters.
-- 2) Ensure quote is not empty/whitespace.
-- 3) Ensure source is one of the supported values.

-- Normalize existing over-limit rows before adding constraints.
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

UPDATE testimonials
SET quote = LEFT(quote, 300)
WHERE quote IS NOT NULL
  AND char_length(quote) > 300;

ALTER TABLE testimonials
  ALTER COLUMN source SET DEFAULT 'manual';

ALTER TABLE testimonials
  DROP CONSTRAINT IF EXISTS testimonials_quote_length_check;

ALTER TABLE testimonials
  ADD CONSTRAINT testimonials_quote_length_check
  CHECK (
    quote IS NOT NULL
    AND char_length(btrim(quote)) > 0
    AND char_length(quote) <= 300
  );

ALTER TABLE testimonials
  DROP CONSTRAINT IF EXISTS testimonials_source_check;

ALTER TABLE testimonials
  ADD CONSTRAINT testimonials_source_check
  CHECK (source IN ('manual', 'google'));
