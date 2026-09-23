-- Restrict CMS and media mutations to accounts explicitly marked as admins in
-- auth.users.raw_app_meta_data. app_metadata is controlled by Supabase Admin,
-- unlike user_metadata, which users can edit themselves.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- CMS content tables: retain existing public SELECT policies, but make every
-- write path admin-only.
DROP POLICY IF EXISTS "Calendar events are editable by authenticated users" ON public.calendar_events;
CREATE POLICY "Calendar events admins can insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Calendar events admins can update" ON public.calendar_events FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Calendar events admins can delete" ON public.calendar_events FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Exceptions are editable by authenticated users" ON public.calendar_recurring_exceptions;
CREATE POLICY "Exceptions admins can insert" ON public.calendar_recurring_exceptions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Exceptions admins can update" ON public.calendar_recurring_exceptions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Exceptions admins can delete" ON public.calendar_recurring_exceptions FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Recurring patterns are editable by authenticated users" ON public.calendar_recurring_patterns;
CREATE POLICY "Recurring patterns admins can insert" ON public.calendar_recurring_patterns FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Recurring patterns admins can update" ON public.calendar_recurring_patterns FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Recurring patterns admins can delete" ON public.calendar_recurring_patterns FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Home content is editable by authenticated users" ON public.home_content;
CREATE POLICY "Home content admins can insert" ON public.home_content FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Home content admins can update" ON public.home_content FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Home content admins can delete" ON public.home_content FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Instructors are editable by authenticated users" ON public.instructors;
CREATE POLICY "Instructors admins can insert" ON public.instructors FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Instructors admins can update" ON public.instructors FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Instructors admins can delete" ON public.instructors FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Media is editable by authenticated users" ON public.media;
CREATE POLICY "Media admins can insert" ON public.media FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Media admins can update" ON public.media FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Media admins can delete" ON public.media FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Outreach content is editable by authenticated users" ON public.outreach_content;
CREATE POLICY "Outreach content admins can insert" ON public.outreach_content FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Outreach content admins can update" ON public.outreach_content FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Outreach content admins can delete" ON public.outreach_content FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Pages are editable by authenticated users" ON public.pages;
DROP POLICY IF EXISTS "Published pages are viewable by everyone" ON public.pages;
CREATE POLICY "Pages admins can insert" ON public.pages FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Pages admins can update" ON public.pages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Pages admins can delete" ON public.pages FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Published pages are viewable by everyone" ON public.pages
  FOR SELECT USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Page versions are editable by authenticated users" ON public.page_versions;
DROP POLICY IF EXISTS "Page versions are viewable by authenticated users" ON public.page_versions;
CREATE POLICY "Page versions are available to admins" ON public.page_versions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Products are editable by authenticated users" ON public.products;
CREATE POLICY "Products admins can insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Products admins can update" ON public.products FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Products admins can delete" ON public.products FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Schema markup is editable by authenticated users" ON public.schema_markup;
CREATE POLICY "Schema markup admins can insert" ON public.schema_markup FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Schema markup admins can update" ON public.schema_markup FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Schema markup admins can delete" ON public.schema_markup FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "SEO settings are editable by authenticated users" ON public.seo_settings;
CREATE POLICY "SEO settings admins can insert" ON public.seo_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "SEO settings admins can update" ON public.seo_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "SEO settings admins can delete" ON public.seo_settings FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Settings are editable by authenticated users" ON public.settings;
CREATE POLICY "Settings admins can insert" ON public.settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Settings admins can update" ON public.settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Settings admins can delete" ON public.settings FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Testimonials are editable by authenticated users" ON public.testimonials;
CREATE POLICY "Testimonials admins can insert" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Testimonials admins can update" ON public.testimonials FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Testimonials admins can delete" ON public.testimonials FOR DELETE TO authenticated USING (public.is_admin());

-- Logs and private submissions should be visible only to admins.
DROP POLICY IF EXISTS "Activity logs are insertable by authenticated users" ON public.activity_logs;
DROP POLICY IF EXISTS "Activity logs are viewable by authenticated users" ON public.activity_logs;
CREATE POLICY "Activity logs are available to admins" ON public.activity_logs
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view page views" ON public.page_views;
CREATE POLICY "Admins can view page views" ON public.page_views
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can read contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (public.is_admin());

-- Public media files remain readable through the public bucket; object changes
-- require the same explicit admin role as the CMS.
DROP POLICY IF EXISTS "Authenticated users can upload to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media bucket objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media bucket objects" ON storage.objects;

CREATE POLICY "Admins can upload to media bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admins can update media bucket objects" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admins can delete media bucket objects" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
