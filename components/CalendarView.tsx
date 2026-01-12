import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import {
  getDaysInMonth,
  getEventsForDate,
  formatTime,
  isSameDay,
  getClassTypeColor,
  getEventTypeIcon,
  sortEventsByTime,
  CalendarView as ViewType
} from '../lib/calendar-utils';

interface CalendarViewProps {
  view: ViewType;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
  searchQuery?: string;
}

interface CalendarViewProps {
  view: ViewType;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  currentDate,
  onDateChange,
  onEventClick,
  searchQuery = ''
}) => {
  const { events, isLoading } = useCalendar();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter events by search query only (events are already filtered by type in CalendarContext)
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (view === 'month') {
    const days = getDaysInMonth(currentDate);
    const today = new Date();

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
        {/* Calendar Header */}
        <div className="bg-brand-charcoal text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold uppercase tracking-wider">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-neutral-400 text-sm">Class Schedule</p>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-neutral-200 dark:bg-neutral-700 gap-px">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(filteredEvents, day);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`bg-white dark:bg-neutral-800 min-h-[120px] p-2 transition-colors cursor-pointer group relative ${
                  !isCurrentMonth ? 'opacity-40' : ''
                } ${isSelected ? 'ring-2 ring-inset ring-brand-red' : ''} ${
                  isToday ? 'bg-red-50 dark:bg-red-900/10' : ''
                } hover:bg-neutral-50 dark:hover:bg-neutral-700/50`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-brand-red text-white'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline-block">
                      {dayEvents.length} {dayEvents.length === 1 ? 'class' : 'classes'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {sortEventsByTime(dayEvents).slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEventClick) onEventClick(event.id);
                      }}
                      className={`text-[10px] px-1.5 py-1 rounded truncate border-l-2 flex items-center gap-1 ${getClassTypeColor(event.class_type)}`}
                    >
                      <span className="flex-shrink-0">{getEventTypeIcon(event.class_type)}</span>
                      <span className="font-bold mr-1">{formatTime(event.start_time)}</span>
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-neutral-400 pl-1 italic">
                      + {dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'list') {
    const upcomingEvents = sortEventsByTime(
      filteredEvents.filter(event => new Date(event.start_time) >= new Date())
    ).slice(0, 20);

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <div className="bg-brand-charcoal text-white p-6">
          <h2 className="text-2xl font-display font-bold uppercase tracking-wider">
            Upcoming Events
          </h2>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {upcomingEvents.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              No upcoming events scheduled.
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick && onEventClick(event.id)}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex-shrink-0">{getEventTypeIcon(event.class_type)}</span>
                      <h3 className="font-bold text-lg dark:text-white">{event.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getClassTypeColor(event.class_type)}`}>
                        {event.class_type}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                      {new Date(event.start_time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm font-bold text-brand-red">
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </p>
                    {event.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'week') {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <div className="bg-brand-charcoal text-white p-6">
          <h2 className="text-2xl font-display font-bold uppercase tracking-wider">
            Week of {startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h2>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {weekDays.map(day => {
            const dayEvents = sortEventsByTime(getEventsForDate(filteredEvents, day));
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={day.toISOString()} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold ${
                    isToday ? 'bg-brand-red text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div>
                    <h3 className="font-bold dark:text-white">{DAYS_OF_WEEK[day.getDay()]}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {day.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                  {dayEvents.length > 0 && (
                    <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>
                <div className="space-y-2 ml-16">
                  {dayEvents.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic">No events scheduled</p>
                  ) : (
                    dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick && onEventClick(event.id)}
                        className={`p-2 rounded border-l-4 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2 ${getClassTypeColor(event.class_type)}`}
                      >
                        <span className="flex-shrink-0">{getEventTypeIcon(event.class_type)}</span>
                        <div className="flex items-center justify-between flex-grow">
                          <span className="font-bold text-sm">{event.title}</span>
                          <span className="text-xs font-bold">{formatTime(event.start_time)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'day') {
    const dayEvents = sortEventsByTime(getEventsForDate(filteredEvents, currentDate));
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <div className="bg-brand-charcoal text-white p-6">
          <h2 className="text-2xl font-display font-bold uppercase tracking-wider">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>
          {isToday && (
            <p className="text-sm text-neutral-300 mt-1">Today</p>
          )}
        </div>
        <div className="p-6">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-lg mb-2">No events scheduled for this day</p>
              <p className="text-sm">Check other days or create a new event in the admin panel</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick && onEventClick(event.id)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getClassTypeColor(event.class_type)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0">{getEventTypeIcon(event.class_type)}</span>
                      <h3 className="font-bold text-lg dark:text-white">{event.title}</h3>
                    </div>
                    <span className="text-sm font-bold text-brand-red">
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getClassTypeColor(event.class_type)}`}>
                      {event.class_type}
                    </span>
                    {event.capacity && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Capacity: {event.capacity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CalendarView;
