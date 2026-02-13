import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCalendar } from '../context/CalendarContext';
import { formatTime, formatDate, getClassTypeColor, formatClassType } from '../lib/calendar-utils';
import Button from './Button';
import { useToast } from '../context/ToastContext';

interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  event?: {
    title: string;
    start_time: string;
    end_time: string;
    class_type: string;
  };
}

const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const { events } = useCalendar();
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      loadBookings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('calendar_bookings')
        .select('*, calendar_events(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setBookings(data.map(booking => ({
          id: booking.id,
          event_id: booking.event_id,
          user_id: booking.user_id,
          status: booking.status,
          created_at: booking.created_at,
          event: booking.calendar_events ? {
            title: booking.calendar_events.title,
            start_time: booking.calendar_events.start_time,
            end_time: booking.calendar_events.end_time,
            class_type: booking.calendar_events.class_type
          } : undefined
        })));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      showError('Failed to load booking history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('calendar_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      showSuccess('Booking cancelled successfully');
      await loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showError('Failed to cancel booking');
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          Please log in to view your booking history.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
        <p className="text-neutral-500 dark:text-neutral-400">Loading bookings...</p>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && 
    b.event && 
    new Date(b.event.start_time) >= new Date()
  );

  const pastBookings = bookings.filter(b => 
    b.status === 'confirmed' && 
    b.event && 
    new Date(b.event.start_time) < new Date()
  );

  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">My Bookings</h2>

      {/* Upcoming Bookings */}
      <div>
        <h3 className="text-lg font-bold mb-4 dark:text-white">Upcoming Classes</h3>
        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No upcoming bookings</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map(booking => booking.event && (
              <div
                key={booking.id}
                className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h4 className="font-bold text-lg dark:text-white mb-1">{booking.event.title}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {formatDate(booking.event.start_time)}
                    </p>
                    <p className="text-sm font-bold text-brand-red">
                      {formatTime(booking.event.start_time)} - {formatTime(booking.event.end_time)}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold uppercase ${getClassTypeColor(booking.event.class_type)}`}>
                      {formatClassType(booking.event.class_type)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(booking.id)}
                    className="ml-4"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 dark:text-white">Past Classes</h3>
          <div className="space-y-3">
            {pastBookings.map(booking => booking.event && (
              <div
                key={booking.id}
                className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 opacity-75"
              >
                <h4 className="font-bold text-sm dark:text-white mb-1">{booking.event.title}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDate(booking.event.start_time)} • {formatTime(booking.event.start_time)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Bookings */}
      {cancelledBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 dark:text-white">Cancelled</h3>
          <div className="space-y-3">
            {cancelledBookings.map(booking => booking.event && (
              <div
                key={booking.id}
                className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 opacity-50"
              >
                <h4 className="font-bold text-sm dark:text-white mb-1 line-through">{booking.event.title}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDate(booking.event.start_time)} • Cancelled
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
