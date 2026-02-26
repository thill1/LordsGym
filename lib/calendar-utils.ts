// Calendar utility functions
import React from 'react';

export interface RecurringPattern {
  id: string;
  pattern_type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  days_of_week: number[] | null;
  end_date: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  instructor_id: string | null;
  class_type: string;
  capacity: number | null;
  booked_count?: number;
  recurring_pattern_id?: string | null;
  occurrence_date?: string | null;
  is_recurring_generated?: boolean;
  is_recurring_preserved?: boolean;
  recurring_series_id?: string | null;
  /** Inline pattern when loaded from Supabase with join */
  recurring_pattern?: RecurringPattern | null;
}

/**
 * Parse recurring instance ID (baseId-YYYY-MM-DD) into base ID and occurrence date.
 * Returns null if the ID is not a composite recurring instance ID.
 */
export function parseRecurringEventId(eventId: string): { baseId: string; occurrenceDate: string } | null {
  const match = eventId.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const [, baseId, occurrenceDate] = match;
  return { baseId, occurrenceDate };
}

/**
 * Get base event ID for lookup/booking. Strips occurrence suffix from recurring instance IDs.
 */
export function getBaseEventId(eventId: string): string {
  const parsed = parseRecurringEventId(eventId);
  return parsed ? parsed.baseId : eventId;
}

/**
 * Convert JS getDay() (0=Sun, 1=Mon, ..., 6=Sat) to DB/ISO format (7=Sun, 1=Mon, ..., 6=Sat).
 */
export function toDbDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Convert DB/ISO day (7=Sun, 1=Mon, ..., 6=Sat) to JS getDay() (0=Sun, 1=Mon, ..., 6=Sat).
 * Handles legacy data stored as 0-6 (toJsDay(0)=0, toJsDay(1)=1, etc.).
 */
export function toJsDay(dbDay: number): number {
  return dbDay === 7 ? 0 : dbDay;
}

/** Gym timezone for interpreting admin-entered times. All calendar times are Pacific. */
export const GYM_TIMEZONE = 'America/Los_Angeles';

/**
 * Format an ISO timestamp as YYYY-MM-DDTHH:mm for datetime-local input, in a given timezone.
 * Use when loading an event for edit so the form shows the correct time regardless of admin browser TZ.
 */
export function formatDatetimeLocalInTimezone(isoString: string, timeZone: string = GYM_TIMEZONE): string {
  const d = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Interpret date (YYYY-MM-DD) + time (HH:mm or HH:mm:ss) as local time in a given timezone,
 * return UTC Date. Use this when the admin enters a time (e.g. 9 AM) so it's stored correctly
 * regardless of the admin's browser timezone. Prevents 8-hour shift for Pacific gym times.
 */
export function combineDateAndTimeInTimezone(
  dateKey: string,
  timePart: string,
  timeZone: string = GYM_TIMEZONE
): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const normalized = timePart.length === 5 ? `${timePart}:00` : timePart;
  const [hours, minutes, seconds] = normalized.split(':').map(Number);

  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(noonUtc);
  const tzHour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const tzMinute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const offsetMinutes = 12 * 60 + 0 - (tzHour * 60 + tzMinute);
  const sec = Number.isFinite(seconds) ? seconds : 0;
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes, sec) + offsetMinutes * 60 * 1000;
  return new Date(utcMs);
}

/** Get local date as YYYY-MM-DD. Use this instead of toISOString().split('T')[0] to avoid UTC shift (e.g. PST midnight → previous day in UTC). */
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Normalize raw days_of_week from DB for use with JS getDay() in expansion.
 * Handles: number[], string[], JSON string, or null/undefined. PostgREST returns
 * arrays as JSON arrays, but edge cases (e.g. mobile Safari) may parse differently.
 */
export function normalizeDaysForExpand(raw: unknown): number[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) arr = raw;
  else if (typeof raw === 'string') {
    try { arr = JSON.parse(raw) as unknown[]; } catch { arr = []; }
  } else if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    arr = []; // might be mis-parsed object
  }
  return arr
    .map(d => toJsDay(Number(d)))
    .filter(d => !Number.isNaN(d) && d >= 0 && d <= 6);
}

/**
 * Expand recurring events into individual occurrences for a date range.
 * Pattern days_of_week: DB format 7=Sun, 1=Mon, ... 6=Sat. Converted to JS getDay() for expansion.
 *
 * CRITICAL: Only expand template events. Materialized events (is_recurring_generated) are
 * concrete occurrences from the DB—pass them through as-is. Expanding them would produce
 * duplicate series (each materialized event would generate a full recurrence), causing
 * cascading duplicates on mobile (e.g. iPhone calendar dots).
 *
 * @param getExceptions - optional function to get exception dates per event (by pattern id)
 */
export function expandRecurringEvents(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date,
  getExceptions: Set<string> | ((event: CalendarEvent) => Set<string>) = new Set()
): CalendarEvent[] {
  const getEx = (e: CalendarEvent) => (typeof getExceptions === 'function' ? getExceptions(e) : getExceptions);
  const result: CalendarEvent[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Group recurring events by pattern. Always expand from the template (original DB entry)
  // so dates align to the user's original day—never use materialized events for display,
  // as they may have been generated with different date logic (UTC vs local).
  const byPattern = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    if (!event.recurring_pattern_id || !event.recurring_pattern) {
      result.push(event);
      continue;
    }
    const pid = event.recurring_pattern_id;
    if (!byPattern.has(pid)) byPattern.set(pid, []);
    byPattern.get(pid)!.push(event);
  }

  for (const [, patternEvents] of byPattern) {
    // Template = original entry (is_recurring_generated false), or earliest start_time
    const templates = patternEvents.filter((e) => !e.is_recurring_generated);
    const event = templates.length > 0
      ? templates.reduce((a, b) => (new Date(a.start_time) < new Date(b.start_time) ? a : b))
      : patternEvents.reduce((a, b) => (new Date(a.start_time) < new Date(b.start_time) ? a : b));
    if (!event.recurring_pattern) continue;
    const pattern = event.recurring_pattern;
    const exceptionDates = getEx(event);
    const templateStart = new Date(event.start_time);
    const templateEnd = new Date(event.end_time);
    const baseDate = new Date(templateStart);
    baseDate.setHours(0, 0, 0, 0);
    const patternEnd = pattern.end_date
      ? (() => {
          const m = pattern.end_date.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (m) {
            const [, y, mo, da] = m.map(Number);
            const end = new Date(y, mo - 1, da);
            end.setHours(23, 59, 59, 999);
            return end;
          }
          return new Date(pattern.end_date);
        })()
      : null;
    const interval = pattern.interval || 1;

    if (pattern.pattern_type === 'daily') {
      let d = new Date(Math.max(baseDate.getTime(), start.getTime()));
      const dayMs = 24 * 60 * 60 * 1000;
      let dayOffset = Math.floor((d.getTime() - baseDate.getTime()) / dayMs);
      if (dayOffset % interval !== 0) {
        dayOffset = dayOffset + (interval - (dayOffset % interval));
        d = new Date(baseDate.getTime() + dayOffset * dayMs);
      }
      while (d <= end) {
        if ((patternEnd && d > patternEnd) || d < baseDate) {
          d.setDate(d.getDate() + interval);
          continue;
        }
        const dateStr = toLocalDateKey(d);
        if (!exceptionDates.has(dateStr)) {
          const occStart = new Date(d);
          occStart.setHours(templateStart.getHours(), templateStart.getMinutes(), 0, 0);
          const occEnd = new Date(d);
          occEnd.setHours(templateEnd.getHours(), templateEnd.getMinutes(), 0, 0);
          result.push({
            ...event,
            id: `${event.id}-${dateStr}`,
            start_time: occStart.toISOString(),
            end_time: occEnd.toISOString(),
          });
        }
        d.setDate(d.getDate() + interval);
      }
    } else if (pattern.pattern_type === 'weekly') {
      const days = normalizeDaysForExpand(pattern.days_of_week ?? []);
      const daysToUse = days.length > 0 ? days : [baseDate.getDay()];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d < baseDate || (patternEnd && d > patternEnd)) continue;
        if (!daysToUse.includes(d.getDay())) continue;
        const weeksSince = Math.floor((d.getTime() - baseDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weeksSince % interval !== 0) continue;
        const dateStr = toLocalDateKey(d);
        if (exceptionDates.has(dateStr)) continue;
        const occStart = new Date(d);
        occStart.setHours(templateStart.getHours(), templateStart.getMinutes(), 0, 0);
        const occEnd = new Date(d);
        occEnd.setHours(templateEnd.getHours(), templateEnd.getMinutes(), 0, 0);
        result.push({
          ...event,
          id: `${event.id}-${dateStr}`,
          start_time: occStart.toISOString(),
          end_time: occEnd.toISOString(),
        });
      }
    } else if (pattern.pattern_type === 'monthly') {
      const dayOfMonth = baseDate.getDate();
      let y = start.getFullYear();
      let m = start.getMonth();
      const endY = end.getFullYear();
      const endM = end.getMonth();
      while (y < endY || (y === endY && m <= endM)) {
        const lastDay = new Date(y, m + 1, 0).getDate();
        const d = new Date(y, m, Math.min(dayOfMonth, lastDay));
        if (d >= baseDate && d >= start && d <= end && (!patternEnd || d <= patternEnd)) {
          const monthsSince = (y - baseDate.getFullYear()) * 12 + (m - baseDate.getMonth());
          if (monthsSince % interval === 0) {
            const dateStr = toLocalDateKey(d);
            if (!exceptionDates.has(dateStr)) {
              const occStart = new Date(d);
              occStart.setHours(templateStart.getHours(), templateStart.getMinutes(), 0, 0);
              const occEnd = new Date(d);
              occEnd.setHours(templateEnd.getHours(), templateEnd.getMinutes(), 0, 0);
              result.push({
                ...event,
                id: `${event.id}-${dateStr}`,
                start_time: occStart.toISOString(),
                end_time: occEnd.toISOString(),
              });
            }
          }
        }
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }
    } else {
      result.push(event);
    }
  }
  const sorted = result.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  return deduplicateRecurringByDate(sorted);
}

/**
 * Ensure at most one event per (recurring_pattern_id, date). Handles overlap between
 * template and materialized events, or duplicate materialized rows.
 */
function deduplicateRecurringByDate(events: CalendarEvent[]): CalendarEvent[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    if (!e.recurring_pattern_id) return true;
    const dateKey = toLocalDateKey(new Date(e.start_time));
    const key = `${e.recurring_pattern_id}:${dateKey}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type CalendarView = 'month' | 'week' | 'day' | 'list';

/**
 * Get start of week for a given date
 */
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

/**
 * Get end of week for a given date
 */
export const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Get all days in a month
 */
export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add days from previous month to fill first week
  const startDay = firstDay.getDay();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - i - 1);
    days.push(d);
  }

  // Add all days in current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to fill last week
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(year, month + 1, i);
    days.push(d);
  }

  return days;
};

/**
 * Get events for a specific date.
 * Uses local date key (YYYY-MM-DD) to avoid timezone shift—toISOString() would
 * convert to UTC and can shift dates (e.g. Jan 15 PST midnight → previous day in UTC),
 * which caused recurring events to not appear on mobile/Safari in western timezones.
 *
 * Deduplicates recurring events so at most one per (pattern, date)—fixes multiple
 * dots on mobile/iPhone when template+materialized or other sources produce duplicates.
 */
export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const dateKey = toLocalDateKey(date);
  const forDate = events.filter(event => toLocalDateKey(new Date(event.start_time)) === dateKey);
  return deduplicateRecurringByDate(forDate);
};

/**
 * Get events for a date range
 */
export const getEventsForRange = (events: CalendarEvent[], start: Date, end: Date): CalendarEvent[] => {
  return events.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate >= start && eventDate <= end;
  });
};

/**
 * Detect all-day events (holidays) where time is midnight-to-midnight or irrelevant.
 */
export const isAllDayEvent = (event: CalendarEvent): boolean => {
  if (event.class_type === 'holiday') return true;
  const s = new Date(event.start_time);
  const e = new Date(event.end_time);
  return s.getHours() === 0 && s.getMinutes() === 0 && e.getHours() === 0 && e.getMinutes() === 0;
};

/**
 * Format time for display. Returns "All Day" for all-day events.
 */
export const formatTimeOrAllDay = (event: CalendarEvent): string => {
  if (isAllDayEvent(event)) return 'All Day';
  const s = new Date(event.start_time);
  const e = new Date(event.end_time);
  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(s)} - ${fmt(e)}`;
};

/**
 * Get the dot color class for a class type (used for compact month view).
 */
export const getClassTypeDotColor = (classType: string): string => {
  const colors: Record<string, string> = {
    community: 'bg-amber-500',
    outreach: 'bg-purple-500',
    fundraisers: 'bg-rose-500',
    self_help: 'bg-teal-500',
    holiday: 'bg-green-500',
  };
  return colors[classType] || 'bg-neutral-400';
};

/**
 * Format time for display
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Format class type for display (e.g. self_help -> "Self Help")
 */
export const formatClassType = (classType: string): string => {
  if (!classType) return '';
  return classType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

/**
 * Get class type color
 */
export const getClassTypeColor = (classType: string): string => {
  const colors: Record<string, string> = {
    community: 'bg-amber-100 text-amber-800 border-amber-500 dark:bg-amber-900/20 dark:text-amber-200',
    outreach: 'bg-purple-100 text-purple-800 border-purple-500 dark:bg-purple-900/20 dark:text-purple-200',
    fundraisers: 'bg-rose-100 text-rose-800 border-rose-500 dark:bg-rose-900/20 dark:text-rose-200',
    self_help: 'bg-teal-100 text-teal-800 border-teal-500 dark:bg-teal-900/20 dark:text-teal-200',
    holiday: 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-200',
  };
  return colors[classType] || 'bg-neutral-100 text-neutral-800 border-neutral-500';
};

/**
 * Get icon component for event type
 */
export const getEventTypeIcon = (classType: string): React.ReactElement => {
  const iconClass = "w-5 h-5";
  
  switch (classType) {
    case 'community':
      return React.createElement('svg', {
        className: iconClass,
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      }));
    case 'outreach':
      return React.createElement('svg', {
        className: iconClass,
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      }));
    case 'fundraisers':
      return React.createElement('svg', {
        className: iconClass,
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      }));
    case 'self_help':
      return React.createElement('svg', {
        className: iconClass,
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
      }));
    case 'holiday':
      return React.createElement('svg', {
        className: iconClass,
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
      }));
    default:
      return React.createElement('svg', {
        className: iconClass,
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }));
  }
};

/**
 * Group events by date (uses local date key to avoid timezone shift).
 */
export const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  const grouped: Record<string, CalendarEvent[]> = {};

  events.forEach((event) => {
    const dateKey = toLocalDateKey(new Date(event.start_time));
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });

  return grouped;
};

/**
 * Sort events by start time
 */
export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
};
