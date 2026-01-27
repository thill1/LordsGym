import React, { createContext, useContext, useState, useEffect } from 'react';
import { CalendarEvent } from '../lib/calendar-utils';
import { getHolidaysForRange } from '../lib/us-holidays';
import { safeGet, safeSet } from '../lib/localStorage';

interface CalendarContextType {
  events: CalendarEvent[];
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

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
      const currentYear = new Date().getFullYear();
      const holidays = getHolidaysForRange(currentYear, currentYear + 1);
      const allEvents = [...customEvents, ...holidays];
      allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(allEvents);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError('Failed to load calendar events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCustomEvents = (customEvents: CalendarEvent[]) => {
    safeSet(STORAGE_KEY, customEvents);
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    saveCustomEvents([...customEvents, newEvent]);
    loadEvents();
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    const customEvents = safeGet<CalendarEvent[]>(STORAGE_KEY, []);
    const updatedEvents = customEvents.map((event) =>
      event.id === id ? { ...event, ...updates } : event
    );
    saveCustomEvents(updatedEvents);
    loadEvents();
  };

  const deleteEvent = (id: string) => {
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
