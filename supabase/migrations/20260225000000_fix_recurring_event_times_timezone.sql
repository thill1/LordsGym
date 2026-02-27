-- One-time fix: correct start_time/end_time for recurring generated events that were
-- stored with UTC interpretation instead of pattern timezone (e.g. 9 AM Pacific stored as 09:00 UTC).
-- Recomputes from occurrence_date + pattern start_time_local/end_time_local in pattern timezone.

UPDATE calendar_events e
SET
  start_time = sub.start_ts,
  end_time   = sub.end_ts
FROM (
  SELECT
    e.id,
    ((e.occurrence_date + p.start_time_local)::timestamp AT TIME ZONE COALESCE(p.timezone, 'America/Los_Angeles')) AS start_ts,
    CASE
      WHEN ((e.occurrence_date + p.end_time_local)::timestamp AT TIME ZONE COALESCE(p.timezone, 'America/Los_Angeles'))
           <= ((e.occurrence_date + p.start_time_local)::timestamp AT TIME ZONE COALESCE(p.timezone, 'America/Los_Angeles'))
      THEN ((e.occurrence_date + p.end_time_local + interval '1 day')::timestamp AT TIME ZONE COALESCE(p.timezone, 'America/Los_Angeles'))
      ELSE ((e.occurrence_date + p.end_time_local)::timestamp AT TIME ZONE COALESCE(p.timezone, 'America/Los_Angeles'))
    END AS end_ts
  FROM calendar_events e
  JOIN calendar_recurring_patterns p ON p.id = e.recurring_pattern_id
  WHERE e.is_recurring_generated = true
    AND e.occurrence_date IS NOT NULL
) sub
WHERE e.id = sub.id;
