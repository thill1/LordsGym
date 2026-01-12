import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from './Button';

interface CalendarBookingFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CalendarBookingForm: React.FC<CalendarBookingFormProps> = ({
  eventId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured()) {
      setError('Booking requires backend configuration');
      showError('Booking requires backend configuration');
      return;
    }

    if (!user) {
      setError('Please log in to book a class');
      showError('Please log in to book a class');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First, check event capacity and current bookings
      const { data: eventData, error: eventError } = await supabase
        .from('calendar_events')
        .select('capacity')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Count current confirmed bookings
      const { count: bookingCount, error: countError } = await supabase
        .from('calendar_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (countError) throw countError;

      const isFull = eventData.capacity && bookingCount && bookingCount >= eventData.capacity;
      const status = isFull ? 'waitlist' : 'confirmed';

      const { error: bookingError } = await supabase
        .from('calendar_bookings')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: status
        });

      if (bookingError) {
        if (bookingError.code === '23505') {
          // Unique constraint violation - already booked
          setError('You have already booked this class');
          showError('You have already booked this class');
        } else {
          throw bookingError;
        }
        return;
      }

      if (isFull) {
        showSuccess('Class is full. You have been added to the waitlist!');
      } else {
        showSuccess('Class booked successfully!');
      }
      onSuccess();
    } catch (err) {
      console.error('Error booking class:', err);
      setError('Failed to book class. Please try again.');
      showError('Failed to book class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {!user && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-700 dark:text-yellow-300 text-sm">
          You need to be logged in to book a class. Please log in and try again.
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="brand"
          disabled={isSubmitting || !user}
          className="flex-1"
        >
          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </div>
    </form>
  );
};

export default CalendarBookingForm;
