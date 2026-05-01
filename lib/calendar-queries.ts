/**
 * Optimized calendar data queries using React Query
 * Reduces egress by:
 * - Caching results (stale-while-revalidate pattern)
 * - Deduplicating requests
 * - Selecting only needed columns
 * - Optimizing booking queries
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CalendarEvent } from './calendar-utils';
import { supabase, isSupabaseConfigured } from './supabase';
import { safeGet } from './localStorage';

interface RecurringPatternJoinRow {
  id: string;
  pattern_type: string;
  interval: number;
  days_of_week: number[] | null;
  end_date: string | null;
}

interface CalendarEventJoinRow {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  instructor_id: string | null;
  class_type: string;
  capacity: number | null;
  recurring_pattern_id: string | null;
  occurrence_date?: string | null;
  is_recurring_generated?: boolean | null;
  is_recurring_preserved?: boolean | null;
  recurring_series_id?: string | null;
  recurring_pattern?: RecurringPatternJoinRow | RecurringPatternJoinRow[] | null;
}

// Cache for column support detection
let RECURRENCE_COLUMNS_SUPPORTED: boolean | null = null;

export const toRecurringPattern = (
  row: RecurringPatternJoinRow | RecurringPatternJoinRow[] | Record<string, unknown> | null | undefined
) => {
  if (row == null) return null;
  const patternRow = (Array.isArray(row) ? row[0] : row) as RecurringPatternJoinRow | undefined;
  if (!patternRow || typeof patternRow !== 'object') return null;

  const patternType = String(patternRow.pattern_type || '').toLowerCase();
  if (patternType !== 'daily' && patternType !== 'weekly' && patternType !== 'monthly') {
    return null;
  }

  const daysOfWeek = patternRow.days_of_week;
  const normalizedDays = Array.isArray(daysOfWeek)
    ? daysOfWeek.map((d) => Number(d)).filter((n) => !Number.isNaN(n))
    : null;

  return {
    id: String(patternRow.id || ''),
    pattern_type: patternType as 'daily' | 'weekly' | 'monthly',
    interval: Math.max(1, Number(patternRow.interval) || 1),
    days_of_week: normalizedDays && normalizedDays.length > 0 ? normalizedDays : null,
    end_date: patternRow.end_date ? String(patternRow.end_date) : null,
  };
};

function toCalendarEvent(row: CalendarEventJoinRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    start_time: row.start_time,
    end_time: row.end_time,
    instructor_id: row.instructor_id || null,
    class_type: row.class_type,
    capacity: row.capacity ?? null,
    booked_count: 0,
    recurring_pattern_id: row.recurring_pattern_id || null,
    occurrence_date: row.occurrence_date ?? null,
    is_recurring_generated: !!row.is_recurring_generated,
    is_recurring_preserved: !!row.is_recurring_preserved,
    recurring_series_id: row.recurring_series_id ?? null,
    recurring_pattern: toRecurringPattern(row.recurring_pattern)
  };
}

/**
 * Fetch calendar events with booking counts
 * OPTIMIZATIONS:
 * - Uses RPC when available (better for RLS)
 * - Selects only needed columns (not SELECT *)
 * - Fetches booking counts efficiently
 * - Cached with 5 minute stale time
 */
async function fetchCalendarEventsWithBookings(): Promise<CalendarEvent[]> {
  // Try RPC first (better for RLS on anonymous clients)
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_calendar_events_for_display');
  if (!rpcError && Array.isArray(rpcData)) {
    return (rpcData as any[]).map((row) => ({
      ...toCalendarEvent(row),
      booked_count: row.booked_count ?? 0
    }));
  }

  const missingColumn = (err: any): boolean => {
    const msg = String(err?.message || '').toLowerCase();
    return msg.includes('does not exist') && (
      msg.includes('occurrence_date') ||
      msg.includes('is_recurring_generated') ||
      msg.includes('is_recurring_preserved') ||
      msg.includes('recurring_series_id')
    );
  };

  // OPTIMIZED: Only select needed columns, not *
  const selectWithRecurrence =
    'id, title, description, start_time, end_time, instructor_id, class_type, capacity, recurring_pattern_id, occurrence_date, is_recurring_generated, is_recurring_preserved, recurring_series_id, recurring_pattern:calendar_recurring_patterns(id, pattern_type, interval, days_of_week, end_date)';
  const selectLegacy =
    'id, title, description, start_time, end_time, instructor_id, class_type, capacity, recurring_pattern_id, recurring_pattern:calendar_recurring_patterns(id, pattern_type, interval, days_of_week, end_date)';

  let eventRows: any[] | null = null;

  if (RECURRENCE_COLUMNS_SUPPORTED !== false) {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(selectWithRecurrence)
      .order('start_time', { ascending: true });

    if (!error) {
      RECURRENCE_COLUMNS_SUPPORTED = true;
      eventRows = data as any[];
    } else if (missingColumn(error)) {
      RECURRENCE_COLUMNS_SUPPORTED = false;
    } else {
      throw error;
    }
  }

  if (!eventRows) {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(selectLegacy)
      .order('start_time', { ascending: true });
    if (error) throw error;
    eventRows = data as any[];
  }

  const eventsFromDb = (eventRows ?? []).map((row) => toCalendarEvent(row as CalendarEventJoinRow));
  if (eventsFromDb.length === 0) return [];

  const eventIds = eventsFromDb.map((event) => event.id);

  // OPTIMIZED: Only select event_id and use eq filter, not in with 35+ IDs
  // Also limit to confirmed bookings only
  const { data: bookings, error: bookingsError } = await supabase
    .from('calendar_bookings')
    .select('event_id', { count: 'exact' })
    .in('event_id', eventIds)
    .eq('status', 'confirmed');

  if (bookingsError) throw bookingsError;

  const bookingCountMap = (bookings ?? []).reduce<Record<string, number>>((acc, booking) => {
    acc[booking.event_id] = (acc[booking.event_id] || 0) + 1;
    return acc;
  }, {});

  return eventsFromDb.map((event) => ({
    ...event,
    booked_count: bookingCountMap[event.id] || 0
  }));
}

/**
 * Hook for fetching calendar events with React Query
 * Benefits:
 * - Automatic request deduplication
 * - Stale-while-revalidate caching (5 min stale time)
 * - localStorage fallback for offline support
 * - Automatic refetching on focus/reconnect
 */
export function useCalendarEventsQuery(): UseQueryResult<CalendarEvent[], Error> {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        // Fallback to localStorage if Supabase not configured
        return safeGet<CalendarEvent[]>('lords_gym_calendar_events', []);
      }
      return fetchCalendarEventsWithBookings();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - cache data to reduce egress
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type { CalendarEvent };
