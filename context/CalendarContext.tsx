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
  occurrence_date: string | null;
  is_recurring_generated: boolean;
  is_recurring_preserved: boolean;
  recurring_series_id: string | null;
  recurring_pattern?: RecurringPatternJoinRow | RecurringPatternJoinRow[] | null;
}

const toRecurringPattern = (
  row: RecurringPatternJoinRow | RecurringPatternJoinRow[] | null | undefined
): RecurringPattern | null => {
  const patternRow = Array.isArray(row) ? row[0] : row;
  if (!patternRow) return null;

  const patternType = patternRow.pattern_type;
  if (patternType !== 'daily' && patternType !== 'weekly' && patternType !== 'monthly') {
    return null;
  }

  return {
    id: patternRow.id,
    pattern_type: patternType,
    interval: patternRow.interval,
    days_of_week: patternRow.days_of_week,
    end_date: patternRow.end_date
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
    occurrence_date: row.occurrence_date || null,
    is_recurring_generated: row.is_recurring_generated || false,
    is_recurring_preserved: row.is_recurring_preserved || false,
    recurring_series_id: row.recurring_series_id || null,
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
    const { data: eventRows, error: eventsError } = await supabase
      .from('calendar_events')
      .select('id, title, description, start_time, end_time, instructor_id, class_type, capacity, recurring_pattern_id, occurrence_date, is_recurring_generated, is_recurring_preserved, recurring_series_id, recurring_pattern:calendar_recurring_patterns(id, pattern_type, interval, days_of_week, end_date)')
      .order('start_time', { ascending: true });

    if (eventsError) throw eventsError;

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
        const { error: insertErr } = await supabase
          .from('calendar_events')
          .insert({
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            instructor_id: event.instructor_id,
            class_type: event.class_type,
            capacity: event.capacity,
            recurring_pattern_id: event.recurring_pattern_id || null,
            occurrence_date: event.occurrence_date || null,
            is_recurring_generated: event.is_recurring_generated || false,
            is_recurring_preserved: event.is_recurring_preserved || false,
            recurring_series_id: event.recurring_series_id || event.recurring_pattern_id || null,
          })
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
        const updatePayload: Record<string, unknown> = {};
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.start_time !== undefined) updatePayload.start_time = updates.start_time;
        if (updates.end_time !== undefined) updatePayload.end_time = updates.end_time;
        if (updates.instructor_id !== undefined) updatePayload.instructor_id = updates.instructor_id;
        if (updates.class_type !== undefined) updatePayload.class_type = updates.class_type;
        if (updates.capacity !== undefined) updatePayload.capacity = updates.capacity;
        if (updates.recurring_pattern_id !== undefined) updatePayload.recurring_pattern_id = updates.recurring_pattern_id;
        if (updates.occurrence_date !== undefined) updatePayload.occurrence_date = updates.occurrence_date;
        if (updates.is_recurring_generated !== undefined) updatePayload.is_recurring_generated = updates.is_recurring_generated;
        if (updates.is_recurring_preserved !== undefined) updatePayload.is_recurring_preserved = updates.is_recurring_preserved;
        if (updates.recurring_series_id !== undefined) updatePayload.recurring_series_id = updates.recurring_series_id;

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
