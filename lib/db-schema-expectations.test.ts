/**
 * Schema expectations unit tests — run without Supabase.
 * Ensures EXPECTED_TABLES and EXPECTED_COLUMNS stay in sync with app usage.
 */
import { describe, it, expect } from 'vitest';
import {
  EXPECTED_TABLES,
  ANON_READABLE_TABLES,
  EXPECTED_COLUMNS,
  EXPECTED_RPC_FUNCTIONS,
} from './db-schema-expectations';

describe('db-schema-expectations', () => {
  it('EXPECTED_TABLES includes all core app tables', () => {
    const core = [
      'settings',
      'home_content',
      'products',
      'testimonials',
      'pages',
      'media',
      'instructors',
      'calendar_recurring_patterns',
      'calendar_events',
      'calendar_bookings',
    ];
    core.forEach((t) => expect(EXPECTED_TABLES).toContain(t));
  });

  it('ANON_READABLE_TABLES is a subset of EXPECTED_TABLES', () => {
    ANON_READABLE_TABLES.forEach((t) => {
      expect(EXPECTED_TABLES).toContain(t);
    });
  });

  it('EXPECTED_COLUMNS covers StoreContext tables', () => {
    expect(EXPECTED_COLUMNS.settings).toContain('site_name');
    expect(EXPECTED_COLUMNS.settings).toContain('popup_modals');
    expect(EXPECTED_COLUMNS.home_content).toContain('hero');
    expect(EXPECTED_COLUMNS.products).toContain('image_coming_soon');
    expect(EXPECTED_COLUMNS.testimonials).toContain('source');
    expect(EXPECTED_COLUMNS.testimonials).toContain('external_id');
  });

  it('EXPECTED_COLUMNS covers calendar tables', () => {
    expect(EXPECTED_COLUMNS.calendar_events).toContain('recurring_pattern_id');
    expect(EXPECTED_COLUMNS.calendar_events).toContain('occurrence_date');
    expect(EXPECTED_COLUMNS.calendar_recurring_patterns).toContain('title');
  });

  it('EXPECTED_RPC_FUNCTIONS includes calendar RPC', () => {
    expect(EXPECTED_RPC_FUNCTIONS).toContain('get_calendar_events_for_display');
  });

  it('no duplicate table names', () => {
    const set = new Set(EXPECTED_TABLES);
    expect(set.size).toBe(EXPECTED_TABLES.length);
  });
});
