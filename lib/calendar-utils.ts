// Calendar utility functions

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
 * Get events for a specific date
 */
export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const dateStr = date.toISOString().split('T')[0];
  return events.filter(event => {
    const eventDate = new Date(event.start_time).toISOString().split('T')[0];
    return eventDate === dateStr;
  });
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
 * Get class type color
 */
export const getClassTypeColor = (classType: string): string => {
  const colors: Record<string, string> = {
    strength: 'bg-red-100 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-200',
    cardio: 'bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/20 dark:text-blue-200',
    recovery: 'bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-200',
    community: 'bg-amber-100 text-amber-800 border-amber-500 dark:bg-amber-900/20 dark:text-amber-200',
  };
  return colors[classType] || 'bg-neutral-100 text-neutral-800 border-neutral-500';
};

/**
 * Group events by date
 */
export const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  const grouped: Record<string, CalendarEvent[]> = {};
  
  events.forEach(event => {
    const dateKey = new Date(event.start_time).toISOString().split('T')[0];
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
