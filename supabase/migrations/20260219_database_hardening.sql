-- Database hardening: RLS, indexes, constraints
-- Improves security, performance, and data integrity.

-- =============================================================================
-- 1. STRIPE RLS: Remove overly permissive policies
-- Service role bypasses RLS; these policies accidentally granted anon/auth full access.
-- =============================================================================
DROP POLICY IF EXISTS "Service role can manage memberships" ON memberships;
DROP POLICY IF EXISTS "Service role can manage payment_intents" ON payment_intents;
-- Result: Only service_role (via bypass) can INSERT/UPDATE/DELETE. Authenticated users retain SELECT on own rows only.

-- =============================================================================
-- 2. CALENDAR_BOOKINGS: Restrict INSERT to own user_id
-- Prevents users from creating bookings for other users.
-- =============================================================================
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON calendar_bookings;
CREATE POLICY "Users can create own bookings" ON calendar_bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 3. INDEXES: Instructor ID foreign keys (join performance)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_calendar_events_instructor_id
  ON calendar_events(instructor_id)
  WHERE instructor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_recurring_patterns_instructor_id
  ON calendar_recurring_patterns(instructor_id)
  WHERE instructor_id IS NOT NULL;

-- =============================================================================
-- 4. STRIPE INDEXES: Idempotent creation (safe migration reruns)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_stripe_subscription ON memberships(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_session ON payment_intents(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);

-- =============================================================================
-- 5. TESTIMONIALS: Prevent duplicate Google review imports
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_source_external_id
  ON testimonials(source, external_id)
  WHERE external_id IS NOT NULL;
