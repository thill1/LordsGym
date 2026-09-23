-- Split admin ALL policies away from public SELECT policies so Postgres does
-- not evaluate two permissive SELECT policies for every public read.

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('calendar_events', 'Calendar events'),
      ('calendar_recurring_exceptions', 'Exceptions'),
      ('calendar_recurring_patterns', 'Recurring patterns'),
      ('home_content', 'Home content'),
      ('instructors', 'Instructors'),
      ('media', 'Media'),
      ('outreach_content', 'Outreach content'),
      ('pages', 'Pages'),
      ('products', 'Products'),
      ('schema_markup', 'Schema markup'),
      ('seo_settings', 'SEO settings'),
      ('settings', 'Settings'),
      ('testimonials', 'Testimonials')
    ) AS entries(table_name, label)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', item.label || ' are editable by admins', item.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', item.label || ' is editable by admins', item.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', item.label || ' admins can insert', item.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', item.label || ' admins can update', item.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', item.label || ' admins can delete', item.table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())', item.label || ' admins can insert', item.table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', item.label || ' admins can update', item.table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', item.label || ' admins can delete', item.table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Service role full access" ON public.contact_submissions;
CREATE POLICY "Service role full access" ON public.contact_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own membership" ON public.memberships;
CREATE POLICY "Users can view own membership" ON public.memberships
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own payment intents" ON public.payment_intents;
CREATE POLICY "Users can view own payment intents" ON public.payment_intents
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
