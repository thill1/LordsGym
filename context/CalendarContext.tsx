import React, { createContext, useContext, useState, useEffect } from 'react';
import { CalendarEvent } from '../lib/calendar-utils';
import { getHolidaysForRange } from '../lib/us-holidays';

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

      // Load custom events from localStorage (Community and Outreach only)
      const savedEventsJson = localStorage.getItem(STORAGE_KEY);
      const customEvents: CalendarEvent[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];

      // Generate US holidays for current year and next year
      const currentYear = new Date().getFullYear();
      const holidays = getHolidaysForRange(currentYear, currentYear + 1);

      // Combine custom events with holidays
      const allEvents = [...customEvents, ...holidays];

      // Sort by start time
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customEvents));
    } catch (err) {
      console.error('Error saving calendar events:', err);
      throw err;
    }
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const savedEventsJson = localStorage.getItem(STORAGE_KEY);
    const customEvents: CalendarEvent[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
    const updatedEvents = [...customEvents, newEvent];
    saveCustomEvents(updatedEvents);
    loadEvents();
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    const savedEventsJson = localStorage.getItem(STORAGE_KEY);
    const customEvents: CalendarEvent[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
    const updatedEvents = customEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    saveCustomEvents(updatedEvents);
    loadEvents();
  };

  const deleteEvent = (id: string) => {
    const savedEventsJson = localStorage.getItem(STORAGE_KEY);
    const customEvents: CalendarEvent[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
    const updatedEvents = customEvents.filter(event => event.id !== id);
    saveCustomEvents(updatedEvents);
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
