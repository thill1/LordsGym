import React, { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { formatClassType } from '../../lib/calendar-utils';

type BookingStatus = 'confirmed' | 'waitlist' | 'cancelled';

interface BookingRow {
  id: string;
  event_id: string;
  user_id: string;
  status: BookingStatus;
  created_at: string;
  calendar_events: BookingEventRow | null;
}

interface BookingEventRow {
  id: string;
  title: string;
  start_time: string;
  class_type: string;
  capacity: number | null;
}

interface BookingRowRaw extends Omit<BookingRow, 'calendar_events'> {
  calendar_events: BookingEventRow | BookingEventRow[] | null;
}

const BookingOversightManager: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [savingBookingId, setSavingBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    if (!isSupabaseConfigured()) {
      setBookings([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('calendar_bookings')
        .select('id, event_id, user_id, status, created_at, calendar_events(id, title, start_time, class_type, capacity)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const normalized = ((data || []) as BookingRowRaw[]).map((row) => ({
        ...row,
        calendar_events: Array.isArray(row.calendar_events) ? (row.calendar_events[0] ?? null) : row.calendar_events
      }));
      setBookings(normalized);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showError('Failed to load booking oversight data.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const text = `${booking.calendar_events?.title || ''} ${booking.user_id}`.toLowerCase();
      const matchesSearch = searchQuery.trim() === '' || text.includes(searchQuery.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [bookings, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        if (booking.status === 'confirmed') acc.confirmed += 1;
        if (booking.status === 'waitlist') acc.waitlist += 1;
        if (booking.status === 'cancelled') acc.cancelled += 1;
        return acc;
      },
      { total: 0, confirmed: 0, waitlist: 0, cancelled: 0 }
    );
  }, [bookings]);

  const handleStatusChange = async (bookingId: string, nextStatus: BookingStatus) => {
    if (!isSupabaseConfigured()) return;

    try {
      setSavingBookingId(bookingId);
      const { error } = await supabase
        .from('calendar_bookings')
        .update({ status: nextStatus })
        .eq('id', bookingId);
      if (error) throw error;

      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? { ...booking, status: nextStatus } : booking))
      );
      showSuccess('Booking status updated.');
    } catch (error) {
      console.error('Error updating booking:', error);
      showError('Failed to update booking status.');
    } finally {
      setSavingBookingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold dark:text-white">Booking Oversight</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Review incoming bookings and manage confirmed, waitlist, and cancelled states.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
          <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">Total</p>
          <p className="text-xl font-bold dark:text-white">{counts.total}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
          <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">Confirmed</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{counts.confirmed}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
          <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">Waitlist</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{counts.waitlist}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
          <p className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">Cancelled</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{counts.cancelled}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by event title or user id..."
          className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BookingStatus)}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="waitlist">Waitlist</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={loadBookings}
          className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="p-4 text-sm font-bold dark:text-white">Event</th>
                <th className="p-4 text-sm font-bold dark:text-white">Class Type</th>
                <th className="p-4 text-sm font-bold dark:text-white">Starts</th>
                <th className="p-4 text-sm font-bold dark:text-white">User</th>
                <th className="p-4 text-sm font-bold dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-sm text-neutral-500 dark:text-neutral-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-sm text-neutral-500 dark:text-neutral-400">
                    No bookings found for the current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="p-4 text-sm font-bold dark:text-white">
                      {booking.calendar_events?.title || '(Event unavailable)'}
                    </td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300">
                      {booking.calendar_events?.class_type ? formatClassType(booking.calendar_events.class_type) : '—'}
                    </td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300">
                      {booking.calendar_events?.start_time
                        ? new Date(booking.calendar_events.start_time).toLocaleString()
                        : '—'}
                    </td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300 font-mono">{booking.user_id}</td>
                    <td className="p-4">
                      <select
                        value={booking.status}
                        disabled={savingBookingId === booking.id}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                        className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-900 dark:text-white"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="waitlist">Waitlist</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingOversightManager;
