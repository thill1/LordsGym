/**
 * Database schema expectations — single source of truth for audit and tests.
 * Must stay in sync with supabase/migrations/*.sql
 */
export const EXPECTED_TABLES = [
  'settings',
  'home_content',
  'outreach_content',
  'products',
  'testimonials',
  'pages',
  'media',
  'instructors',
  'calendar_recurring_patterns',
  'calendar_events',
  'calendar_bookings',
  'calendar_recurring_exceptions',
  'activity_logs',
  'page_versions',
  'seo_settings',
  'schema_markup',
  'page_views',
  'memberships',
  'payment_intents',
  'contact_submissions',
] as const;

export type ExpectedTable = (typeof EXPECTED_TABLES)[number];

/** Tables the app reads with anon key (public SELECT) */
export const ANON_READABLE_TABLES: ExpectedTable[] = [
  'settings',
  'home_content',
  'outreach_content',
  'products',
  'testimonials',
  'pages',
  'media',
  'instructors',
  'calendar_recurring_patterns',
  'calendar_events',
  'calendar_recurring_exceptions',
  'schema_markup',
];

/** Key columns required for app logic (subset; full schema in migrations) */
export const EXPECTED_COLUMNS: Partial<Record<ExpectedTable, string[]>> = {
  settings: ['id', 'site_name', 'contact_email', 'contact_phone', 'address', 'announcement_bar', 'popup_modals'],
  home_content: ['id', 'hero', 'values'],
  outreach_content: ['id', 'images', 'created_at', 'updated_at'],
  products: ['id', 'title', 'price', 'category', 'image', 'description', 'featured', 'image_coming_soon', 'coming_soon_image'],
  testimonials: ['id', 'name', 'role', 'quote', 'source', 'external_id'],
  pages: ['id', 'slug', 'title', 'content', 'published'],
  calendar_events: ['id', 'title', 'start_time', 'end_time', 'recurring_pattern_id', 'occurrence_date'],
  calendar_recurring_patterns: ['id', 'pattern_type', 'title', 'start_time_local', 'end_time_local'],
};

/** RPC functions used by the app */
export const EXPECTED_RPC_FUNCTIONS = ['get_calendar_events_for_display'] as const;
