-- Safety constraints for recurrence materialization and regeneration.
-- Ensures recurring metadata stays consistent as events are regenerated.

UPDATE calendar_events
SET occurrence_date = (start_time AT TIME ZONE 'UTC')::date
WHERE recurring_pattern_id IS NOT NULL
  AND occurrence_date IS NULL;

UPDATE calendar_events
SET recurring_series_id = recurring_pattern_id
WHERE recurring_pattern_id IS NOT NULL
  AND recurring_series_id IS NULL;

CREATE OR REPLACE FUNCTION set_calendar_event_recurrence_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recurring_pattern_id IS NOT NULL AND NEW.occurrence_date IS NULL THEN
    NEW.occurrence_date := (NEW.start_time AT TIME ZONE 'UTC')::date;
  END IF;

  IF NEW.recurring_pattern_id IS NOT NULL AND NEW.recurring_series_id IS NULL THEN
    NEW.recurring_series_id := NEW.recurring_pattern_id;
  END IF;

  IF NEW.is_recurring_generated IS NULL THEN
    NEW.is_recurring_generated := false;
  END IF;

  IF NEW.is_recurring_preserved IS NULL THEN
    NEW.is_recurring_preserved := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_calendar_event_recurrence_defaults_trigger ON calendar_events;
CREATE TRIGGER set_calendar_event_recurrence_defaults_trigger
BEFORE INSERT OR UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION set_calendar_event_recurrence_defaults();

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_days_of_week_range_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_days_of_week_range_check
  CHECK (
    days_of_week IS NULL
    OR days_of_week <@ ARRAY[0,1,2,3,4,5,6]::INTEGER[]
  );

ALTER TABLE calendar_recurring_patterns
  DROP CONSTRAINT IF EXISTS calendar_recurring_patterns_end_date_after_start_check;
ALTER TABLE calendar_recurring_patterns
  ADD CONSTRAINT calendar_recurring_patterns_end_date_after_start_check
  CHECK (end_date IS NULL OR end_date::date >= starts_on);

ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_generated_requires_pattern_check;
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_generated_requires_pattern_check
  CHECK (
    is_recurring_generated = false
    OR recurring_pattern_id IS NOT NULL
  );

ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_preserved_requires_series_check;
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_preserved_requires_series_check
  CHECK (
    is_recurring_preserved = false
    OR recurring_series_id IS NOT NULL
  );

ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_pattern_requires_occurrence_date_check;
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_pattern_requires_occurrence_date_check
  CHECK (
    recurring_pattern_id IS NULL
    OR occurrence_date IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_calendar_events_pattern_occurrence_date
  ON calendar_events(recurring_pattern_id, occurrence_date);

CREATE INDEX IF NOT EXISTS idx_calendar_bookings_event_status
  ON calendar_bookings(event_id, status);
