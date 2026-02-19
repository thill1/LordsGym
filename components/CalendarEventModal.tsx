import React, { useEffect, useRef, useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import {
  formatTime,
  formatDate,
  getClassTypeColor,
  formatClassType,
  isAllDayEvent,
  formatTimeOrAllDay,
  getBaseEventId,
  parseRecurringEventId,
  type CalendarEvent,
} from '../lib/calendar-utils';
import CalendarBookingForm from './CalendarBookingForm';
import Button from './Button';

interface CalendarEventModalProps {
  eventId: string | null;
  onClose: () => void;
  onBook?: (eventId: string) => void;
}

const DAYS_MAP: Record<number, string> = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  eventId,
  onClose,
  onBook
}) => {
  const { events } = useCalendar();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    contentRef.current?.focus();
  }, [eventId]);

  if (!eventId) return null;

  // Resolve event: support recurring instance IDs (baseId-YYYY-MM-DD)
  const parsed = parseRecurringEventId(eventId);
  let event: CalendarEvent | undefined = events.find(e => e.id === eventId);
  if (!event && parsed) {
    event = events.find(e => e.id === parsed!.baseId);
  }
  if (!event) return null;

  // For recurring instances, build display event with occurrence date/time
  let displayEvent = event;
  if (parsed) {
    const templateStart = new Date(event.start_time);
    const templateEnd = new Date(event.end_time);
    const [y, m, d] = parsed.occurrenceDate.split('-').map(Number);
    const occStart = new Date(y, m - 1, d, templateStart.getHours(), templateStart.getMinutes(), 0, 0);
    const occEnd = new Date(y, m - 1, d, templateEnd.getHours(), templateEnd.getMinutes(), 0, 0);
    displayEvent = { ...event, start_time: occStart.toISOString(), end_time: occEnd.toISOString() };
  }

  // Use base ID for booking (DB expects base event UUID)
  const bookingEventId = getBaseEventId(eventId);

  const allDay = isAllDayEvent(displayEvent);
  const remaining = displayEvent.capacity ? displayEvent.capacity - (displayEvent.booked_count ?? 0) : null;
  const pct = displayEvent.capacity ? Math.round(((displayEvent.booked_count ?? 0) / displayEvent.capacity) * 100) : 0;
  const isFull = remaining !== null && remaining <= 0;

  const recurringLabel = (() => {
    const pat = displayEvent.recurring_pattern;
    if (!pat) return null;
    if (pat.pattern_type === 'daily') return pat.interval === 1 ? 'Repeats daily' : `Repeats every ${pat.interval} days`;
    if (pat.pattern_type === 'weekly') {
      const dayNames = (pat.days_of_week || []).map(d => DAYS_MAP[d === 7 ? 0 : d] || '').filter(Boolean);
      const prefix = pat.interval === 1 ? 'Every' : `Every ${pat.interval} weeks on`;
      return `${prefix} ${dayNames.join(', ')}`;
    }
    return pat.interval === 1 ? 'Repeats monthly' : `Repeats every ${pat.interval} months`;
  })();

  const colorClass = getClassTypeColor(displayEvent.class_type);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={displayEvent.title}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="bg-white dark:bg-neutral-800 w-full sm:rounded-xl sm:max-w-lg sm:mx-4 rounded-t-xl sm:rounded-b-xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto outline-none"
      >
        {/* Colored header bar */}
        <div className={`px-5 py-4 sm:rounded-t-xl ${colorClass} border-b border-neutral-200 dark:border-neutral-700`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase opacity-80">{formatClassType(displayEvent.class_type)}</span>
              <h2 className="text-xl font-bold mt-0.5 truncate">{displayEvent.title}</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="font-bold dark:text-white">{formatDate(displayEvent.start_time)}</p>
              <p className="text-sm text-brand-red font-bold">
                {allDay ? 'All Day' : `${formatTime(displayEvent.start_time)} - ${formatTime(displayEvent.end_time)}`}
              </p>
            </div>
          </div>

          {/* Recurring indicator */}
          {recurringLabel && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium dark:text-white">{recurringLabel}</p>
                {displayEvent.recurring_pattern?.end_date && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Until {new Date(displayEvent.recurring_pattern.end_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {displayEvent.description && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{displayEvent.description}</p>
            </div>
          )}

          {/* Capacity progress bar */}
          {displayEvent.capacity != null && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium dark:text-white">
                    {remaining != null && remaining > 0
                      ? `${remaining} of ${displayEvent.capacity} spots remaining`
                      : isFull ? 'Class is full' : `${displayEvent.capacity} spots`}
                  </p>
                  <span className="text-xs text-neutral-400">{displayEvent.booked_count ?? 0}/{displayEvent.capacity}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isFull ? 'bg-yellow-500' : 'bg-brand-red'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {isFull && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Join the waitlist below</p>
                )}
              </div>
            </div>
          )}

          {/* Booking */}
          {onBook && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              {showBookingForm ? (
                <CalendarBookingForm
                  eventId={bookingEventId}
                  onSuccess={() => { onBook(bookingEventId); onClose(); }}
                  onCancel={() => setShowBookingForm(false)}
                />
              ) : (
                <Button fullWidth variant="brand" onClick={() => setShowBookingForm(true)}>
                  {isFull ? 'Join Waitlist' : 'Book This Class'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;
