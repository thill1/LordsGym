-- Allow public (anon) to read recurring patterns and exceptions for calendar display.
-- The calendar page is public; visitors need pattern data to see recurring events.

DROP POLICY IF EXISTS "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions;
CREATE POLICY "Exceptions are viewable by everyone" ON calendar_recurring_exceptions FOR SELECT USING (true);
