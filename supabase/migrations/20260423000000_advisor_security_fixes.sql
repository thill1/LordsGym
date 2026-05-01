-- Security Advisor fixes (4 critical findings):
-- 1) Remove user_metadata-based RLS checks on calendar_bookings.
-- 2) Replace with app_metadata-based admin checks (not user-editable).
-- 3) Remove auth.users exposure from public.active_memberships_view.
-- 4) Ensure replacement view uses SECURITY INVOKER semantics.

-- -----------------------------------------------------------------------------
-- CALENDAR BOOKINGS RLS: stop using user_metadata in policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.calendar_bookings;
CREATE POLICY "Users can view their own bookings"
  ON public.calendar_bookings
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.role() = 'service_role'
    OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.calendar_bookings;
CREATE POLICY "Users can update their own bookings"
  ON public.calendar_bookings
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.role() = 'service_role'
    OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- -----------------------------------------------------------------------------
-- MEMBERSHIPS VIEW: remove auth.users join + avoid security definer view
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.active_memberships_view;

CREATE VIEW public.active_memberships_view
WITH (security_invoker = true)
AS
SELECT
  m.id,
  m.user_id,
  m.membership_type,
  m.status,
  m.current_period_start,
  m.current_period_end,
  m.stripe_subscription_id,
  CASE
    WHEN m.current_period_end < NOW() THEN 'expired'
    WHEN m.current_period_end < NOW() + INTERVAL '7 days' THEN 'expires_soon'
    ELSE 'active'
  END AS renewal_status
FROM public.memberships m
WHERE m.status = 'active';

COMMENT ON VIEW public.active_memberships_view IS
  'Active memberships without auth.users join; security_invoker enabled.';
