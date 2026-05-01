-- Fix testimonials: reset sequence and ensure quote column has no hidden length limit.
-- Prevents "duplicate key violates unique constraint" errors after manual inserts.
-- TEXT columns in PostgreSQL have no implicit limit; this is a safety reset.

-- Reset the SERIAL sequence to avoid ID collisions
SELECT setval(
  pg_get_serial_sequence('testimonials', 'id'),
  COALESCE((SELECT MAX(id) FROM testimonials), 0) + 1,
  false
);
