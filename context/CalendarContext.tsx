import React, { createContext, useContext, useState, useEffect } from 'react';
import { CalendarEvent, expandRecurringEvents } from '../lib/calendar-utils';
import { getHolidaysForRange } from '../lib/us-holidays';
import { safeGet, safeSet } from '../lib/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface CalendarContextType {
  events: CalendarEvent[];
  /** Base events (no expansion) - for admin table to edit/delete series */
  baseEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const STORAGE_KEY = 'lords_gym_calendar_events';

function toCalendarEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || null,
    start_time: row.start_time as string,
    end_time: row.end_time as string,
    instructor_id: (row.instructor_id as string) || null,
    class_type: row.class_type as string,
    capacity: (row.capacity as number) ?? null,
    recurring_pattern_id: (row.recurring_pattern_id as string) || null,
    recurring_pattern: row.recurring_pattern
      ? {
          id: (row.recurring_pattern as Record<string, unknown>).id as string,
          pattern_type: (row.recurring_pattern as Record<string, unknown>).pattern_type as 'daily' | 'weekly' | 'monthly',
          interval: (row.recurring_pattern as Record<string, unknown>).interval as number,
          days_of_week: ((row.recurring_pattern as Record<string, unknown>).days_of_week as number[] | null) || null,
          end_date: ((row.recurring_pattern as Record<string, unknown>).end_date as string) || null,
        }
      : null,
  };
}

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [baseEvents, setBaseEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    const currentYear = new Date().getFullYear();
    const holidays = getHolidaysForRange(currentYear, currentYear + 1);
    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    const rangeStart = new Date(currentYear, 0, 1);
    const rangeEnd = new Date(currentYear + 1, 11, 31);

    try {
      let dbEvents: CalendarEvent[] = [];
      const exceptionDatesByPattern = new Map<string, Set<string>>();

      if (isSupabaseConfigured()) {
        const { data: eventsData, error: eventsErr } = await supabase
          .from('calendar_events')
          .select('id, title, description, start_time, end_time, instructor_id, class_type, capacity, recurring_pattern_id')
          .in('class_type', ['community', 'outreach']);

        if (eventsErr) throw eventsErr;

        let patterns: Record<string, { id: string; pattern_type: string; interval: number; days_of_week: number[] | null; end_date: string | null }> = {};
        const patternIds = (eventsData || []).map((r) => r.recurring_pattern_id).filter(Boolean) as string[];
        if (patternIds.length > 0) {
          const { data: patternsData } = await supabase
            .from('calendar_recurring_patterns')
            .select('id, pattern_type, interval, days_of_week, end_date')
            .in('id', patternIds);
          if (patternsData) {
            patterns = Object.fromEntries(patternsData.map((p) => [p.id, p]));
          }
        }

        if (eventsData) {
          dbEvents = eventsData.map((row) => {
            const event = toCalendarEvent(row as Record<string, unknown>);
            if (row.recurring_pattern_id && patterns[row.recurring_pattern_id]) {
              event.recurring_pattern = patterns[row.recurring_pattern_id] as CalendarEvent['recurring_pattern'];
            }
            return event;
          });
        }

        const { data: exceptionsData } = await supabase
          .from('calendar_recurring_exceptions')
          .select('recurring_pattern_id, exception_date');
        if (exceptionsData) {
          exceptionsData.forEach((ex) => {
            const pid = ex.recurring_pattern_id as string;
            if (!exceptionDatesByPattern.has(pid)) exceptionDatesByPattern.set(pid, new Set());
            exceptionDatesByPattern.get(pid)!.add(ex.exception_date);
          });
        }
      }

      const expanded = expandRecurringEvents(
        dbEvents,
        rangeStart,
        rangeEnd,
        (event) => event.recurring_pattern_id ? exceptionDatesByPattern.get(event.recurring_pattern_id) ?? new Set() : new Set()
      );
      const allEvents = isSupabaseConfigured()
        ? [...expanded, ...holidays]
        : [...customEvents, ...holidays];
      allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(allEvents);
      const base = isSupabaseConfigured() ? dbEvents : customEvents;
      base.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setBaseEvents(base);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError('Failed to load calendar events');
      const fallback = [...customEvents, ...holidays];
      fallback.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(fallback);
      setBaseEvents(customEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCustomEvents = (customEvents: CalendarEvent[]) => {
    safeSet(STORAGE_KEY, customEvents);
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error: insertErr } = await supabase
          .from('calendar_events')
          .insert({
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            instructor_id: event.instructor_id,
            class_type: event.class_type,
            capacity: event.capacity,
          })
          .select('id')
          .single();
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
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    saveCustomEvents([...customEvents, newEvent]);
    loadEvents();
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (isSupabaseConfigured() && !id.startsWith('event-')) {
      try {
        const { error: updateErr } = await supabase
          .from('calendar_events')
          .update({
            title: updates.title,
            description: updates.description,
            start_time: updates.start_time,
            end_time: updates.end_time,
            class_type: updates.class_type,
            capacity: updates.capacity,
          })
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
    loadEvents();
  };

  const deleteEvent = async (id: string) => {
    if (isSupabaseConfigured()) {
      const parts = id.split('-');
      const baseId = parts.length >= 8 ? parts.slice(0, 5).join('-') : id;
      if (!baseId.startsWith('event-')) {
        try {
          const { error: deleteErr } = await supabase.from('calendar_events').delete().eq('id', baseId);
          if (deleteErr) throw deleteErr;
          await loadEvents();
          return;
        } catch (err) {
          console.error('Error deleting event from Supabase:', err);
          throw err;
        }
      }
    }
    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    saveCustomEvents(customEvents.filter((event) => event.id !== id));
    loadEvents();
  };

  const refreshEvents = async () => {
    await loadEvents();
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
