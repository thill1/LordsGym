-- Fix testimonials id sequence if it falls out of sync (e.g. after manual inserts or imports)
-- Run this in Supabase SQL Editor if you see "duplicate key value violates unique constraint" on testimonials insert

SELECT setval(
  pg_get_serial_sequence('testimonials', 'id'),
  coalesce((SELECT max(id) FROM testimonials), 0) + 1,
  false
);
