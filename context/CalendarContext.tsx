import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CalendarEvent } from '../lib/calendar-utils';

interface CalendarContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    if (!isSupabaseConfigured()) {
      // Fallback to empty array if Supabase not configured
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        // Filter to only show Community, Outreach, and Holiday events
        const allowedTypes = ['community', 'outreach', 'holiday'];
        const filteredData = data.filter(event => allowedTypes.includes(event.class_type?.toLowerCase()));
        
        // Get booking counts for each event
        const eventIds = filteredData.map(e => e.id);
        const { data: bookingsData } = await supabase
          .from('calendar_bookings')
          .select('event_id')
          .in('event_id', eventIds)
          .eq('status', 'confirmed');

        const bookingCounts = new Map<string, number>();
        if (bookingsData) {
          bookingsData.forEach(booking => {
            bookingCounts.set(booking.event_id, (bookingCounts.get(booking.event_id) || 0) + 1);
          });
        }

        setEvents(filteredData.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          instructor_id: event.instructor_id,
          class_type: event.class_type,
          capacity: event.capacity,
          booked_count: bookingCounts.get(event.id) || 0
        })));
      }
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError('Failed to load calendar events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEvents = async () => {
    await loadEvents();
  };

  useEffect(() => {
    loadEvents();

    // Set up real-time subscription if Supabase is configured
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('calendar_events_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calendar_events'
          },
          () => {
            loadEvents();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        events,
        isLoading,
        error,
        loadEvents,
        refreshEvents
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
