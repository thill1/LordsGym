-- Ensure calendar_recurring_patterns has UPDATE/INSERT/DELETE policy for authenticated users.
-- Fixes: Edit recurring event shows success toast but changes don't persist (RLS blocks when policy missing).
-- The SELECT policy was changed to "viewable by everyone" in 20260219000000; this ensures writes still work.

DROP POLICY IF EXISTS "Recurring patterns are editable by authenticated users" ON calendar_recurring_patterns;
CREATE POLICY "Recurring patterns are editable by authenticated users" ON calendar_recurring_patterns
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
