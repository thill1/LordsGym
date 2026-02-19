-- Ensure recurring patterns and exceptions are viewable by everyone (anon).
-- The public calendar page needs this to expand recurring events. Without it,
-- anonymous visitors (including mobile Safari) get recurring_pattern: null
-- from the join, so recurring events do not expand/show.

DROP POLICY IF EXISTS "Recurring patterns are viewable by authenticated users" ON calendar_recurring_patterns;
DROP POLICY IF EXISTS "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are viewable by everyone" ON calendar_recurring_patterns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions;
DROP POLICY IF EXISTS "Exceptions are viewable by everyone" ON calendar_recurring_exceptions;
CREATE POLICY "Exceptions are viewable by everyone" ON calendar_recurring_exceptions FOR SELECT USING (true);
