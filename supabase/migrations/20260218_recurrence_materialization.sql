-- Recurrence materialization schema for calendar series synchronization.
-- Adds series metadata needed to generate concrete events and track safe regeneration.

ALTER TABLE calendar_recurring_patterns
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Recurring Event',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS class_type TEXT NOT NULL DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS start_time_local TIME NOT NULL DEFAULT TIME '09:00:00',
  ADD COLUMN IF NOT EXISTS end_time_local TIME NOT NULL DEFAULT TIME '10:00:00',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS generation_horizon_days INTEGER NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS last_materialized_at TIMESTAMPTZ;

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_pattern_type_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_pattern_type_check
    CHECK (pattern_type IN ('daily', 'weekly', 'monthly'));

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_interval_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_interval_check
    CHECK (interval >= 1);

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_generation_horizon_days_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_generation_horizon_days_check
    CHECK (generation_horizon_days >= 1);

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_time_window_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_time_window_check
    CHECK (end_time_local > start_time_local);

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS occurrence_date DATE,
  ADD COLUMN IF NOT EXISTS is_recurring_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_recurring_preserved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_series_id UUID;

UPDATE calendar_events
SET
  occurrence_date = COALESCE(occurrence_date, (start_time AT TIME ZONE 'UTC')::DATE),
  is_recurring_generated = CASE WHEN recurring_pattern_id IS NOT NULL THEN true ELSE is_recurring_generated END,
  recurring_series_id = COALESCE(recurring_series_id, recurring_pattern_id)
WHERE occurrence_date IS NULL
   OR recurring_pattern_id IS NOT NULL
   OR recurring_series_id IS NULL;

UPDATE calendar_recurring_patterns p
SET
  title = COALESCE(p.title, seed.title, 'Recurring Event'),
  description = COALESCE(p.description, seed.description),
  class_type = COALESCE(p.class_type, seed.class_type, 'community'),
  instructor_id = COALESCE(p.instructor_id, seed.instructor_id),
  capacity = COALESCE(p.capacity, seed.capacity),
  starts_on = COALESCE(p.starts_on, seed.starts_on, CURRENT_DATE),
  start_time_local = COALESCE(p.start_time_local, seed.start_time_local, TIME '09:00:00'),
  end_time_local = COALESCE(p.end_time_local, seed.end_time_local, TIME '10:00:00')
FROM (
  SELECT DISTINCT ON (e.recurring_pattern_id)
    e.recurring_pattern_id AS pattern_id,
    e.title,
    e.description,
    e.class_type,
    e.instructor_id,
    e.capacity,
    (e.start_time AT TIME ZONE 'UTC')::DATE AS starts_on,
    (e.start_time AT TIME ZONE 'UTC')::TIME AS start_time_local,
    (e.end_time AT TIME ZONE 'UTC')::TIME AS end_time_local
  FROM calendar_events e
  WHERE e.recurring_pattern_id IS NOT NULL
  ORDER BY e.recurring_pattern_id, e.start_time ASC
) AS seed
WHERE p.id = seed.pattern_id;

CREATE INDEX IF NOT EXISTS idx_recurring_patterns_active ON calendar_recurring_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_patterns_starts_on ON calendar_recurring_patterns(starts_on);
CREATE INDEX IF NOT EXISTS idx_calendar_events_occurrence_date ON calendar_events(occurrence_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_pattern_id_start_time ON calendar_events(recurring_pattern_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_series_id ON calendar_events(recurring_series_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring_generated ON calendar_events(is_recurring_generated);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_calendar_events_generated_occurrence
  ON calendar_events(recurring_pattern_id, occurrence_date)
  WHERE recurring_pattern_id IS NOT NULL AND is_recurring_generated = true;

-- Enable admin booking oversight while preserving member self-service.
DROP POLICY IF EXISTS "Users can view their own bookings" ON calendar_bookings;
CREATE POLICY "Users can view their own bookings" ON calendar_bookings
FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);

DROP POLICY IF EXISTS "Users can update their own bookings" ON calendar_bookings;
CREATE POLICY "Users can update their own bookings" ON calendar_bookings
FOR UPDATE
USING (
  auth.uid() = user_id
  OR auth.role() = 'service_role'
  OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);
