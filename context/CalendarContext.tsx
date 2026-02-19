import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CalendarEvent, RecurringPattern } from '../lib/calendar-utils';
import { getHolidaysForRange } from '../lib/us-holidays';
import { safeGet, safeSet } from '../lib/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface CalendarContextType {
  events: CalendarEvent[];
  /** Editable event rows from storage/database (without holidays). */
  baseEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const STORAGE_KEY = 'lords_gym_calendar_events';
// Production can be behind on DB migrations; detect and fall back gracefully.
let RECURRENCE_COLUMNS_SUPPORTED: boolean | null = null;

const sortByStartTime = (items: CalendarEvent[]): CalendarEvent[] => {
  return [...items].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
};

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

const toRecurringPattern = (
  row: RecurringPatternJoinRow | RecurringPatternJoinRow[] | Record<string, unknown> | null | undefined
): RecurringPattern | null => {
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

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [baseEvents, setBaseEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHolidayEvents = useCallback((customEvents: CalendarEvent[]) => {
    const currentYear = new Date().getFullYear();
    const eventYears = customEvents.map((event) => new Date(event.start_time).getFullYear());
    const startYear = Math.min(currentYear, ...eventYears);
    const endYear = Math.max(currentYear + 1, ...eventYears);
    return getHolidaysForRange(startYear, endYear);
  }, []);

  const loadSupabaseEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    // Prefer RPC: bypasses RLS on calendar_recurring_patterns so anon (e.g. mobile Safari) see recurring events
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
    const { data: bookings, error: bookingsError } = await supabase
      .from('calendar_bookings')
      .select('event_id')
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
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const customEvents = isSupabaseConfigured()
        ? await loadSupabaseEvents()
        : safeGet<CalendarEvent[]>(STORAGE_KEY, []);

      const sortedBaseEvents = sortByStartTime(customEvents);
      const holidays = getHolidayEvents(sortedBaseEvents);
      const allEvents = sortByStartTime([...sortedBaseEvents, ...holidays]);

      setBaseEvents(sortedBaseEvents);
      setEvents(allEvents);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError('Failed to load calendar events');
      setBaseEvents([]);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [getHolidayEvents, loadSupabaseEvents]);

  const saveCustomEvents = useCallback((customEvents: CalendarEvent[]) => {
    safeSet(STORAGE_KEY, customEvents);
  }, []);

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (isSupabaseConfigured()) {
      try {
        const canWriteRecurrenceCols = RECURRENCE_COLUMNS_SUPPORTED === true;
        const payload: Record<string, unknown> = {
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          instructor_id: event.instructor_id,
          class_type: event.class_type,
          capacity: event.capacity,
          recurring_pattern_id: event.recurring_pattern_id || null,
        };
        if (canWriteRecurrenceCols) {
          payload.occurrence_date = event.occurrence_date || null;
          payload.is_recurring_generated = event.is_recurring_generated || false;
          payload.is_recurring_preserved = event.is_recurring_preserved || false;
          payload.recurring_series_id = event.recurring_series_id || event.recurring_pattern_id || null;
        }

        const { error: insertErr } = await supabase
          .from('calendar_events')
          .insert(payload)
        if (insertErr) throw insertErr;
        await loadEvents();
        return;
      } catch (err) {
        console.error('Error adding event to Supabase:', err);
        throw err;
      }
    }
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    saveCustomEvents([...customEvents, newEvent]);
    await loadEvents();
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (isSupabaseConfigured()) {
      try {
        const canWriteRecurrenceCols = RECURRENCE_COLUMNS_SUPPORTED === true;
        const updatePayload: Record<string, unknown> = {};
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.start_time !== undefined) updatePayload.start_time = updates.start_time;
        if (updates.end_time !== undefined) updatePayload.end_time = updates.end_time;
        if (updates.instructor_id !== undefined) updatePayload.instructor_id = updates.instructor_id;
        if (updates.class_type !== undefined) updatePayload.class_type = updates.class_type;
        if (updates.capacity !== undefined) updatePayload.capacity = updates.capacity;
        if (updates.recurring_pattern_id !== undefined) updatePayload.recurring_pattern_id = updates.recurring_pattern_id;
        if (canWriteRecurrenceCols) {
          if (updates.occurrence_date !== undefined) updatePayload.occurrence_date = updates.occurrence_date;
          if (updates.is_recurring_generated !== undefined) updatePayload.is_recurring_generated = updates.is_recurring_generated;
          if (updates.is_recurring_preserved !== undefined) updatePayload.is_recurring_preserved = updates.is_recurring_preserved;
          if (updates.recurring_series_id !== undefined) updatePayload.recurring_series_id = updates.recurring_series_id;
        }

        if (Object.keys(updatePayload).length === 0) {
          return;
        }

        const { error: updateErr } = await supabase
          .from('calendar_events')
          .update(updatePayload)
          .eq('id', id);
        if (updateErr) throw updateErr;
        await loadEvents();
        return;
      } catch (err) {
        console.error('Error updating event in Supabase:', err);
        throw err;
      }
    }

    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    const updatedEvents = customEvents.map((event) =>
      event.id === id ? { ...event, ...updates } : event
    );
    saveCustomEvents(updatedEvents);
    await loadEvents();
  };

  const deleteEvent = async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error: deleteErr } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', id);
        if (deleteErr) throw deleteErr;
        await loadEvents();
        return;
      } catch (err) {
        console.error('Error deleting event from Supabase:', err);
        throw err;
      }
    }

    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    saveCustomEvents(customEvents.filter((event) => event.id !== id));
    await loadEvents();
  };

  const refreshEvents = useCallback(async () => {
    await loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <CalendarContext.Provider
      value={{
        events,
        baseEvents,
        isLoading,
        error,
        loadEvents,
        refreshEvents,
        addEvent,
        updateEvent,
        deleteEvent
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider');
  }
  return context;
};
