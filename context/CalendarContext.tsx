import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CalendarEvent, RecurringPattern } from '../lib/calendar-utils';
import { getHolidaysForRange } from '../lib/us-holidays';
import { safeGet, safeSet } from '../lib/localStorage';
import { useCalendarEventsQuery } from '../lib/calendar-queries';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

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

const toEventPayload = (event: Omit<CalendarEvent, 'id'> | Partial<CalendarEvent>) => {
  const payload: Record<string, unknown> = {};
  const source = event as Partial<CalendarEvent>;
  const writableKeys: Array<Exclude<keyof CalendarEvent, 'id' | 'booked_count' | 'recurring_pattern'>> = [
    'title', 'description', 'start_time', 'end_time', 'instructor_id',
    'class_type', 'capacity', 'recurring_pattern_id', 'occurrence_date',
    'is_recurring_generated', 'is_recurring_preserved', 'recurring_series_id'
  ];
  for (const key of writableKeys) {
    if (source[key] !== undefined) payload[key] = source[key];
  }
  return payload;
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [baseEvents, setBaseEvents] = useState<CalendarEvent[]>([]);

  // Use React Query hook for calendar events with optimized caching
  const { data: queryEvents, isLoading: queryIsLoading, error: queryError, refetch } = useCalendarEventsQuery();

  const getHolidayEvents = useCallback((customEvents: CalendarEvent[]) => {
    const currentYear = new Date().getFullYear();
    const eventYears = customEvents.map((event) => new Date(event.start_time).getFullYear());
    const startYear = Math.min(currentYear, ...eventYears);
    const endYear = Math.max(currentYear + 1, ...eventYears);
    return getHolidaysForRange(startYear, endYear);
  }, []);

  const saveCustomEvents = useCallback((customEvents: CalendarEvent[]) => {
    safeSet(STORAGE_KEY, customEvents);
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        // Refetch from React Query to get latest data with proper caching
        await refetch();
      } else {
        // Fallback to localStorage when Supabase not configured
        const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
        const sortedBaseEvents = sortByStartTime(customEvents);
        const holidays = getHolidayEvents(sortedBaseEvents);
        const allEvents = sortByStartTime([...sortedBaseEvents, ...holidays]);

        setBaseEvents(sortedBaseEvents);
        setEvents(allEvents);
      }
    } catch (err) {
      console.error('Error loading calendar events:', err);
    }
  }, [refetch, getHolidayEvents]);

  // Update events when query data changes
  useEffect(() => {
    if (queryEvents && queryEvents.length >= 0) {
      const sortedBaseEvents = sortByStartTime(queryEvents);
      const holidays = getHolidayEvents(sortedBaseEvents);
      const allEvents = sortByStartTime([...sortedBaseEvents, ...holidays]);

      setBaseEvents(sortedBaseEvents);
      setEvents(allEvents);
    }
  }, [queryEvents, getHolidayEvents]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('calendar_events').insert(toEventPayload(event));
      if (error) throw error;
      await refetch();
      return;
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
      const { error } = await supabase
        .from('calendar_events')
        .update({ ...toEventPayload(updates), updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await refetch();
      return;
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
      const { error } = await supabase.from('calendar_events').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      return;
    }

    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    saveCustomEvents(customEvents.filter((event) => event.id !== id));
    await loadEvents();
  };

  const refreshEvents = useCallback(async () => {
    await loadEvents();
  }, [loadEvents]);

  return (
    <CalendarContext.Provider
      value={{
        events,
        baseEvents,
        isLoading: queryIsLoading,
        error: queryError ? queryError.message : null,
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
