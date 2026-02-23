-- Validation: Compare target schema to expected tables
-- Run against target. Expected tables from Lord's Gym migrations:
-- settings, home_content, products, testimonials, pages, media, instructors,
-- calendar_recurring_patterns, calendar_events, calendar_recurring_exceptions,
-- calendar_bookings, page_views, page_versions, activity_logs, seo_settings,
-- schema_markup, contact_submissions, memberships, payment_intents, popup_modals (in settings)

SELECT
  c.relname AS table_name,
  CASE WHEN c.relname IN (
    'settings', 'home_content', 'products', 'testimonials', 'pages', 'media',
    'instructors', 'calendar_recurring_patterns', 'calendar_events',
    'calendar_recurring_exceptions', 'calendar_bookings', 'page_views',
    'page_versions', 'activity_logs', 'seo_settings', 'schema_markup',
    'contact_submissions', 'memberships', 'payment_intents'
  ) THEN 'OK' ELSE 'UNEXPECTED' END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;
