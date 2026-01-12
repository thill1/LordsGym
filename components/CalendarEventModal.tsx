import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { formatTime, formatDate, getClassTypeColor, getEventTypeIcon } from '../lib/calendar-utils';
import CalendarBookingForm from './CalendarBookingForm';
import Button from './Button';

interface CalendarEventModalProps {
  eventId: string | null;
  onClose: () => void;
  onBook?: (eventId: string) => void;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  eventId,
  onClose,
  onBook
}) => {
  const { events } = useCalendar();
  const [showBookingForm, setShowBookingForm] = useState(false);

  if (!eventId) return null;

  const event = events.find(e => e.id === eventId);
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold dark:text-white">{event.title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0">{getEventTypeIcon(event.class_type)}</span>
              <span className={`px-3 py-1 rounded text-sm font-bold uppercase ${getClassTypeColor(event.class_type)}`}>
                {event.class_type}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">Date & Time</h3>
              <p className="text-lg font-bold dark:text-white">{formatDate(event.start_time)}</p>
              <p className="text-brand-red font-bold">
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </p>
            </div>

            {event.description && (
              <div>
                <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">Description</h3>
                <p className="text-neutral-700 dark:text-neutral-300">{event.description}</p>
              </div>
            )}

            {event.capacity && (
              <div>
                <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">Capacity</h3>
                <p className="dark:text-white">{event.capacity} spots available</p>
              </div>
            )}

            {event.booked_count !== undefined && event.capacity && (
              <div>
                <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">Availability</h3>
                <p className="dark:text-white">
                  {event.capacity - event.booked_count} of {event.capacity} spots remaining
                </p>
                {event.capacity - event.booked_count === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    Class is full. Join the waitlist!
                  </p>
                )}
              </div>
            )}

            {onBook && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                {showBookingForm ? (
                  <CalendarBookingForm
                    eventId={event.id}
                    onSuccess={() => {
                      if (onBook) onBook(event.id);
                      onClose();
                    }}
                    onCancel={() => setShowBookingForm(false)}
                  />
                ) : (
                  <Button
                    fullWidth
                    variant="brand"
                    onClick={() => setShowBookingForm(true)}
                  >
                    Book This Class
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;
