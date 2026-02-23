-- Validation: Ensure RLS enabled on expected tables
-- Tables that MUST have RLS: settings, home_content, products, testimonials,
-- pages, media, instructors, calendar_events, calendar_recurring_patterns,
-- calendar_recurring_exceptions, calendar_bookings, page_views, page_versions,
-- activity_logs, seo_settings, schema_markup, contact_submissions,
-- memberships, payment_intents

SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  CASE WHEN c.relrowsecurity THEN 'OK' ELSE 'MISSING RLS' END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'settings', 'home_content', 'products', 'testimonials', 'pages', 'media',
    'instructors', 'calendar_events', 'calendar_recurring_patterns',
    'calendar_recurring_exceptions', 'calendar_bookings', 'page_views',
    'page_versions', 'activity_logs', 'seo_settings', 'schema_markup',
    'contact_submissions', 'memberships', 'payment_intents'
  )
ORDER BY c.relname;
