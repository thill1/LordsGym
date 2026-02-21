/**
 * Calendar recurring events – regression tests
 *
 * Guards against:
 * - Multiple dots/duplicate events per date (pattern, date)
 * - Recurring dates shifting away from original DB entry
 * - Materialized events overriding template (source of truth)
 */
import { describe, it, expect } from 'vitest';
import {
  expandRecurringEvents,
  getEventsForDate,
  type CalendarEvent,
  type RecurringPattern,
} from './calendar-utils';

const PATTERN_ID = 'pattern-abc';
const WEEKLY_PATTERN: RecurringPattern = {
  id: PATTERN_ID,
  pattern_type: 'weekly',
  interval: 1,
  days_of_week: [1],
  end_date: null,
};

function templateEvent(startIso: string, overrides?: Partial<CalendarEvent>): CalendarEvent {
  const start = new Date(startIso);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    id: 'ev-template',
    title: 'Weekly Class',
    description: null,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    instructor_id: null,
    class_type: 'community',
    capacity: null,
    recurring_pattern_id: PATTERN_ID,
    is_recurring_generated: false,
    recurring_pattern: WEEKLY_PATTERN,
    ...overrides,
  };
}

function materializedEvent(dateStr: string, eventId: string): CalendarEvent {
  const start = new Date(`${dateStr}T17:00:00.000Z`);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    id: eventId,
    title: 'Weekly Class',
    description: null,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    instructor_id: null,
    class_type: 'community',
    capacity: null,
    recurring_pattern_id: PATTERN_ID,
    occurrence_date: dateStr,
    is_recurring_generated: true,
    recurring_pattern: WEEKLY_PATTERN,
  };
}

describe('expandRecurringEvents', () => {
  it('produces at most one event per (pattern, date) – no duplicate dots', () => {
    const template = templateEvent('2025-02-17T17:00:00.000Z');
    const start = new Date(2025, 1, 1);
    const end = new Date(2025, 2, 31);
    const expanded = expandRecurringEvents([template], start, end);
    const byDate = new Map<string, number>();
    for (const e of expanded) {
      if (!e.recurring_pattern_id) continue;
      const key = `${e.recurring_pattern_id}:${new Date(e.start_time).toISOString().split('T')[0]}`;
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }
    const duplicates = [...byDate.entries()].filter(([, count]) => count > 1);
    expect(duplicates).toHaveLength(0);
  });

  it('aligns recurring dates to template original day – weekly on same weekday', () => {
    const template = templateEvent('2025-02-17T17:00:00.000Z');
    const templateDay = new Date(template.start_time).getDay();
    const start = new Date(2025, 1, 1);
    const end = new Date(2025, 2, 28);
    const expanded = expandRecurringEvents([template], start, end);
    for (const e of expanded) {
      const d = new Date(e.start_time);
      expect(d.getDay()).toBe(templateDay);
    }
  });

  it('always expands from template, never uses materialized – template is source of truth', () => {
    const template = templateEvent('2025-02-17T17:00:00.000Z');
    const mat1 = materializedEvent('2025-02-24', 'ev-mat-1');
    const mat2 = materializedEvent('2025-03-03', 'ev-mat-2');
    const start = new Date(2025, 1, 1);
    const end = new Date(2025, 2, 31);
    const expanded = expandRecurringEvents([template, mat1, mat2], start, end);
    const templateDay = new Date(template.start_time).getDay();
    for (const e of expanded) {
      const d = new Date(e.start_time);
      expect(d.getDay()).toBe(templateDay);
    }
    expect(expanded.length).toBeGreaterThanOrEqual(4);
  });

  it('derives day-of-week from template when days_of_week empty', () => {
    const template = templateEvent('2025-02-17T17:00:00.000Z');
    const patternNoDays: RecurringPattern = { ...WEEKLY_PATTERN, days_of_week: null };
    const ev = { ...template, recurring_pattern: patternNoDays };
    const start = new Date(2025, 1, 1);
    const end = new Date(2025, 2, 28);
    const expanded = expandRecurringEvents([ev], start, end);
    const templateDay = new Date(template.start_time).getDay();
    for (const e of expanded) {
      expect(new Date(e.start_time).getDay()).toBe(templateDay);
    }
  });
});

describe('getEventsForDate', () => {
  it('returns at most one event per recurring pattern per date', () => {
    const ev1 = materializedEvent('2025-02-17', 'ev-1');
    const ev2 = { ...materializedEvent('2025-02-17', 'ev-2'), id: 'ev-2' };
    const events = [ev1, ev2];
    const date = new Date(2025, 1, 17);
    const forDate = getEventsForDate(events, date);
    const recurring = forDate.filter((e) => e.recurring_pattern_id);
    const byPattern = new Map<string, number>();
    for (const e of recurring) {
      const k = `${e.recurring_pattern_id}:${new Date(e.start_time).toISOString().split('T')[0]}`;
      byPattern.set(k, (byPattern.get(k) ?? 0) + 1);
    }
    const duplicates = [...byPattern.values()].filter((c) => c > 1);
    expect(duplicates).toHaveLength(0);
    expect(forDate.length).toBe(1);
  });
});
