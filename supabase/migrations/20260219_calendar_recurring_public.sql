-- Calendar recurring fix: RPC + RLS for public display.
-- 1. RPC bypasses RLS so anon (e.g. mobile Safari) get recurring pattern data.
-- 2. RLS policies allow public read on recurring patterns and exceptions.

-- RPC: returns events with recurring_pattern for all users
CREATE OR REPLACE FUNCTION public.get_calendar_events_for_display()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      (row_to_json(t)::jsonb) ORDER BY t.start_time
    ),
    '[]'::jsonb
  )
  INTO result
  FROM (
    SELECT
      e.id,
      e.title,
      e.description,
      e.start_time,
      e.end_time,
      e.instructor_id,
      e.class_type,
      e.capacity,
      e.recurring_pattern_id,
      e.occurrence_date,
      COALESCE(e.is_recurring_generated, false) AS is_recurring_generated,
      COALESCE(e.is_recurring_preserved, false) AS is_recurring_preserved,
      e.recurring_series_id,
      (SELECT count(*)::int FROM calendar_bookings b WHERE b.event_id = e.id AND b.status = 'confirmed') AS booked_count,
      CASE
        WHEN p.id IS NOT NULL THEN jsonb_build_object(
          'id', p.id,
          'pattern_type', p.pattern_type,
          'interval', COALESCE(p.interval, 1),
          'days_of_week', p.days_of_week,
          'end_date', p.end_date
        )
        ELSE NULL
      END AS recurring_pattern
    FROM calendar_events e
    LEFT JOIN calendar_recurring_patterns p ON p.id = e.recurring_pattern_id
  ) t;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_calendar_events_for_display() TO anon;
GRANT EXECUTE ON FUNCTION public.get_calendar_events_for_display() TO authenticated;

COMMENT ON FUNCTION public.get_calendar_events_for_display() IS
  'Returns calendar events with recurring pattern data for public display. Bypasses RLS so anon visitors (e.g. mobile Safari) see recurring events.';

-- RLS: allow public read on recurring patterns and exceptions
DROP POLICY IF EXISTS "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns;
DROP POLICY IF EXISTS "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions;
DROP POLICY IF EXISTS "Exceptions are viewable by everyone" ON calendar_recurring_exceptions;
CREATE POLICY "Exceptions are viewable by everyone" ON calendar_recurring_exceptions FOR SELECT USING (true);
