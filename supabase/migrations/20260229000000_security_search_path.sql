-- Supabase Security Advisor: Fix function search_path (search path injection)
-- Add SET search_path = public to functions that lacked it.
-- See: https://supabase.com/docs/guides/platform/security-advisor

-- 1. uuid_generate_v4 (public wrapper uses gen_random_uuid)
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid
LANGUAGE sql
SET search_path = public
AS $$
  SELECT gen_random_uuid();
$$;

-- 2. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. set_calendar_event_recurrence_defaults
CREATE OR REPLACE FUNCTION public.set_calendar_event_recurrence_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- 4. has_active_membership
CREATE OR REPLACE FUNCTION public.has_active_membership(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = p_user_id
    AND status = 'active'
    AND current_period_end > NOW()
  );
END;
$$;

-- 5. get_user_membership
CREATE OR REPLACE FUNCTION public.get_user_membership(p_user_id UUID)
RETURNS TABLE (
  membership_type VARCHAR,
  status VARCHAR,
  current_period_end TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.membership_type,
    m.status,
    m.current_period_end,
    EXTRACT(DAY FROM (m.current_period_end - NOW()))::INTEGER as days_remaining
  FROM public.memberships m
  WHERE m.user_id = p_user_id
  AND m.status = 'active'
  LIMIT 1;
END;
$$;
