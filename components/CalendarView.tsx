import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useCalendar } from '../context/CalendarContext';
import {
  getDaysInMonth,
  getEventsForDate,
  expandRecurringEvents,
  formatTime,
  isSameDay,
  getClassTypeColor,
  getClassTypeDotColor,
  formatClassType,
  formatTimeOrAllDay,
  isAllDayEvent,
  sortEventsByTime,
  CalendarView as ViewType,
  CalendarEvent
} from '../lib/calendar-utils';

interface CalendarViewProps {
  view: ViewType;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
  searchQuery?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EventCard: React.FC<{ event: CalendarEvent; onClick?: () => void; compact?: boolean }> = ({ event, onClick, compact }) => {
  const allDay = isAllDayEvent(event);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onKeyDown={handleKeyDown}
      className={`rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getClassTypeColor(event.class_type)} ${compact ? 'p-2' : 'p-3'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-bold truncate ${compact ? 'text-xs' : 'text-sm'}`}>{event.title}</span>
        <span className={`flex-shrink-0 font-bold ${compact ? 'text-[10px]' : 'text-xs'} opacity-80`}>
          {allDay ? 'All Day' : formatTime(event.start_time)}
        </span>
      </div>
      {!compact && event.description && (
        <p className="text-xs opacity-70 mt-1 line-clamp-2">{event.description}</p>
      )}
    </div>
  );
};

const DayPopover: React.FC<{ date: Date; events: CalendarEvent[]; onEventClick?: (id: string) => void; onClose: () => void }> = ({ date, events, onEventClick, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    const firstFocusable = ref.current?.querySelector<HTMLElement>('button[aria-label="Close"]');
    firstFocusable?.focus();
    return () => {
      prevFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const focusables = ref.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-0 sm:absolute sm:inset-auto sm:p-0"
      onClick={onClose}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Events for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-sm sm:w-72 overflow-hidden z-50"
      >
        <div className="bg-brand-charcoal text-white px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-neutral-400">{events.length} {events.length === 1 ? 'event' : 'events'}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">No events</p>
          ) : (
            sortEventsByTime(events).map(ev => (
              <EventCard key={ev.id} event={ev} compact onClick={() => onEventClick?.(ev.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  currentDate,
  onDateChange,
  onEventClick,
  searchQuery = ''
}) => {
  const { events, isLoading } = useCalendar();
  const [popoverDate, setPopoverDate] = useState<Date | null>(null);
  const [listShowPast, setListShowPast] = useState(false);

  const expandedEvents = useMemo(() => {
    const rangeStart = new Date(currentDate);
    rangeStart.setMonth(rangeStart.getMonth() - 1);
    rangeStart.setDate(1);
    const rangeEnd = new Date(currentDate);
    rangeEnd.setMonth(rangeEnd.getMonth() + 2);
    rangeEnd.setDate(0);
    return expandRecurringEvents(events, rangeStart, rangeEnd);
  }, [events, currentDate]);

  const filteredEvents = useMemo(() => expandedEvents.filter(event => {
    if (searchQuery === '') return true;
    const q = searchQuery.toLowerCase();
    return event.title.toLowerCase().includes(q) || event.description?.toLowerCase().includes(q);
  }), [expandedEvents, searchQuery]);

  const handleDayClick = useCallback((day: Date, isCurrentMonth: boolean) => {
    setPopoverDate(day);
    if (isCurrentMonth) onDateChange(day);
  }, [onDateChange]);

  const closePopover = useCallback(() => setPopoverDate(null), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  // ──── MONTH VIEW ────
  if (view === 'month') {
    const days = getDaysInMonth(currentDate);
    const today = new Date();

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
        {/* Month header */}
        <div className="bg-brand-charcoal text-white px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* Days-of-week header */}
        <div className="grid grid-cols-7 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
          {DAYS_OF_WEEK.map((day, i) => (
            <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{DAYS_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 bg-neutral-200 dark:bg-neutral-700 gap-px">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(filteredEvents, day);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const hasEvents = dayEvents.length > 0;
            const isPopoverOpen = popoverDate && isSameDay(day, popoverDate);

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day, isCurrentMonth)}
                className={`relative bg-white dark:bg-neutral-800 min-h-[52px] sm:min-h-[100px] p-1 sm:p-2 transition-colors cursor-pointer ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${isPopoverOpen ? 'ring-2 ring-inset ring-brand-red z-10' : ''} ${
                  isToday && !isPopoverOpen ? 'bg-red-50/80 dark:bg-red-900/10' : ''
                } hover:bg-neutral-50 dark:hover:bg-neutral-700/50`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <span
                    className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-colors ${
                      isToday
                        ? 'bg-brand-red text-white shadow-sm'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {hasEvents && (
                    <span className="hidden sm:inline text-[10px] text-neutral-400 font-mono">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Mobile: colored dots */}
                {hasEvents && (
                  <div className="flex gap-0.5 flex-wrap sm:hidden justify-center mt-0.5">
                    {dayEvents.slice(0, 4).map(ev => (
                      <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${getClassTypeDotColor(ev.class_type)}`} />
                    ))}
                    {dayEvents.length > 4 && <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />}
                  </div>
                )}

                {/* Desktop: event pills */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  {sortEventsByTime(dayEvents).slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(event.id); }}
                      className={`text-[11px] leading-tight px-1.5 py-0.5 rounded truncate border-l-2 ${getClassTypeColor(event.class_type)}`}
                    >
                      <span className="font-bold mr-1">
                        {isAllDayEvent(event) ? '' : formatTime(event.start_time)}
                      </span>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-neutral-400 pl-1">+ {dayEvents.length - 3} more</div>
                  )}
                </div>

                {/* Popover */}
                {isPopoverOpen && (
                  <DayPopover date={day} events={dayEvents} onEventClick={onEventClick} onClose={closePopover} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ──── LIST VIEW ────
  if (view === 'list') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const listEvents = sortEventsByTime(
      listShowPast
        ? filteredEvents
        : filteredEvents.filter(event => new Date(event.start_time) >= now)
    );
    const grouped: Record<string, CalendarEvent[]> = {};
    for (const ev of listEvents.slice(0, 50)) {
      const key = new Date(ev.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      (grouped[key] ??= []).push(ev);
    }

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <div className="bg-brand-charcoal text-white px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider">
            {listShowPast ? 'All Events' : 'Upcoming Events'}
          </h2>
          <button
            type="button"
            onClick={() => setListShowPast(!listShowPast)}
            className="text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors self-start sm:self-auto"
          >
            {listShowPast ? 'Show upcoming only' : 'Show past events'}
          </button>
        </div>
        {listEvents.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-neutral-500 dark:text-neutral-400">
              {listShowPast ? 'No events found.' : 'No upcoming events scheduled.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {Object.entries(grouped).map(([dateLabel, evts]) => (
              <div key={dateLabel}>
                <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50 sticky top-0">
                  <p className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">{dateLabel}</p>
                </div>
                <div className="p-3 space-y-2">
                  {evts.map(event => (
                    <EventCard key={event.id} event={event} onClick={() => onEventClick?.(event.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ──── WEEK VIEW ────
  if (view === 'week') {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <div className="bg-brand-charcoal text-white px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider">
            Week of {startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h2>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {weekDays.map(day => {
            const dayEvents = sortEventsByTime(getEventsForDate(filteredEvents, day));
            const isToday = isSameDay(day, new Date());

            return (
              <div key={day.toISOString()} className={`p-3 sm:p-4 transition-colors ${isToday ? 'bg-red-50/50 dark:bg-red-900/5' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full font-bold text-sm ${
                    isToday ? 'bg-brand-red text-white shadow-sm' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm dark:text-white">
                      {day.toLocaleDateString('en-US', { weekday: 'long' })}
                      {isToday && <span className="ml-2 text-xs text-brand-red font-normal">Today</span>}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>
                <div className="space-y-2 ml-[52px] sm:ml-[56px]">
                  {dayEvents.length === 0 ? (
                    <p className="text-sm text-neutral-300 dark:text-neutral-600 italic">No events</p>
                  ) : (
                    dayEvents.map(event => (
                      <EventCard key={event.id} event={event} compact onClick={() => onEventClick?.(event.id)} />
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

  // ──── DAY VIEW ────
  if (view === 'day') {
    const dayEvents = sortEventsByTime(getEventsForDate(filteredEvents, currentDate));
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <div className="bg-brand-charcoal text-white px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wider">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          {isToday && <p className="text-xs text-brand-red mt-1 font-bold">Today</p>}
        </div>
        <div className="p-4 sm:p-6">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-neutral-500 dark:text-neutral-400">No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event.id)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getClassTypeColor(event.class_type)}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-bold text-base dark:text-white">{event.title}</h3>
                    <span className="text-sm font-bold text-brand-red flex-shrink-0">
                      {formatTimeOrAllDay(event)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm opacity-70 mt-1">{event.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getClassTypeColor(event.class_type)}`}>
                      {formatClassType(event.class_type)}
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
