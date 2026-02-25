-- Export calendar-related data from a restored Supabase project.
-- Run this in Supabase Dashboard → SQL Editor after restoring your project.
-- For each table, run the SELECT and use "Download as CSV" or copy the result.
-- Order matters for restore: instructors → patterns → exceptions → events → bookings.

-- 1. Instructors
SELECT * FROM public.instructors ORDER BY name;

-- 2. Recurring patterns
SELECT * FROM public.calendar_recurring_patterns ORDER BY created_at;

-- 3. Recurring exceptions
SELECT * FROM public.calendar_recurring_exceptions ORDER BY exception_date;

-- 4. Calendar events (may be many rows)
SELECT * FROM public.calendar_events ORDER BY start_time;

-- 5. Bookings
SELECT * FROM public.calendar_bookings ORDER BY created_at;
