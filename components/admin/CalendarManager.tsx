import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent, formatClassType, toDbDay, toJsDay } from '../../lib/calendar-utils';
import { logEventAction } from '../../lib/activity-logger';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { syncRecurringPattern } from '../../lib/recurring-events';
import ConfirmDialog from '../ConfirmDialog';
import RecurringEventsManager from './RecurringEventsManager';
import InstructorsManager from './InstructorsManager';
import BookingOversightManager from './BookingOversightManager';

type CalendarTab = 'events' | 'recurring' | 'instructors' | 'bookings';

interface Instructor {
  id: string;
  name: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const emptyForm = {
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  class_type: 'community' as 'community' | 'outreach' | 'fundraisers' | 'self_help',
  capacity: '',
  instructor_id: '',
  isRecurring: false,
  pattern_type: 'weekly' as 'daily' | 'weekly' | 'monthly',
  interval: 1,
  days_of_week: [] as number[],
  end_date: ''
};

const CalendarManager: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { events, baseEvents, isLoading, addEvent, updateEvent, deleteEvent, refreshEvents } = useCalendar();

  const [activeTab, setActiveTab] = useState<CalendarTab>('events');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; eventId: string | null }>({ isOpen: false, eventId: null });
  const [filterClassType, setFilterClassType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    refreshEvents();
    loadInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const loadInstructors = async () => {
    if (!isSupabaseConfigured()) {
      setInstructors([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
    }
  };

  const normalizeTimePart = (dateTime: string): string => {
    const part = dateTime.split('T')[1] || '00:00';
    return part.length === 5 ? `${part}:00` : part;
  };

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const openModal = async (event?: CalendarEvent) => {
    if (event && event.class_type === 'holiday') {
      showError('Holidays are automatically generated and cannot be edited.');
      return;
    }

    if (!event) {
      setEditingEvent(null);
      setFormData(emptyForm);
      setIsModalOpen(true);
      return;
    }

    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      class_type: event.class_type as 'community' | 'outreach' | 'fundraisers' | 'self_help',
      capacity: event.capacity?.toString() || '',
      instructor_id: event.instructor_id || '',
      isRecurring: !!event.recurring_pattern_id,
      pattern_type: 'weekly',
      interval: 1,
      days_of_week: [],
      end_date: ''
    });
    setIsModalOpen(true);

    if (!event.recurring_pattern_id || !isSupabaseConfigured()) {
      return;
    }

    try {
      const { data: pattern, error } = await supabase
        .from('calendar_recurring_patterns')
        .select('pattern_type, interval, days_of_week, end_date')
        .eq('id', event.recurring_pattern_id)
        .single();
      if (error) throw error;

      setFormData((prev) => ({
        ...prev,
        isRecurring: true,
        pattern_type: (pattern.pattern_type as 'daily' | 'weekly' | 'monthly') || 'weekly',
        interval: pattern.interval || 1,
        days_of_week: (pattern.days_of_week || []).map((d: number) => toJsDay(Number(d))).filter((d: number) => d >= 0 && d <= 6),
        end_date: pattern.end_date ? pattern.end_date.slice(0, 10) : ''
      }));
    } catch (error) {
      console.error('Error loading recurring pattern details:', error);
    }
  };

  const getBookedCount = async (eventId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('calendar_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['confirmed', 'waitlist']);

    if (error) throw error;
    return count || 0;
  };

  const removeGeneratedOccurrence = async (patternId: string, occurrenceDate: string) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('recurring_pattern_id', patternId)
      .eq('occurrence_date', occurrenceDate)
      .eq('is_recurring_generated', true);

    if (error) throw error;
    const ids = (data || []).map((row) => row.id);
    if (ids.length === 0) return;

    const { error: delError } = await supabase
      .from('calendar_events')
      .delete()
      .in('id', ids);

    if (delError) throw delError;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isRecurring && formData.pattern_type === 'weekly' && formData.days_of_week.length === 0) {
      showError('Please select at least one day of the week for weekly recurrence.');
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      showError('Start time and end time are required.');
      return;
    }

    const startDate = new Date(formData.start_time);
    const endDate = new Date(formData.end_time);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      showError('End time must be after start time.');
      return;
    }

    if (editingEvent?.recurring_pattern_id && !formData.isRecurring) {
      showError('To remove recurrence, use the Recurring tab to pause or delete the series.');
      return;
    }

    try {
      const eventData: Omit<CalendarEvent, 'id'> = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        instructor_id: formData.instructor_id || null,
        class_type: formData.class_type,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null
      };

      if (formData.isRecurring && isSupabaseConfigured()) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';
        const startsOn = formData.start_time.split('T')[0];

        const basePayload = {
          pattern_type: formData.pattern_type,
          interval: Math.max(1, formData.interval || 1),
          days_of_week: formData.pattern_type === 'weekly' ? formData.days_of_week.map(toDbDay) : null,
          end_date: formData.end_date ? `${formData.end_date}T23:59:59.000Z` : null,
        };

        const extendedFields = {
          title: eventData.title,
          description: eventData.description,
          class_type: eventData.class_type,
          instructor_id: eventData.instructor_id,
          capacity: eventData.capacity,
          starts_on: startsOn,
          start_time_local: normalizeTimePart(formData.start_time),
          end_time_local: normalizeTimePart(formData.end_time),
          timezone,
          is_active: true
        };

        const isColumnError = (err: { code?: string; message?: string }) =>
          err.code === 'PGRST204' || (err.message ?? '').includes('column');

        const insertPattern = async (): Promise<string> => {
          const fullPayload = { ...basePayload, ...extendedFields };
          const { data, error } = await supabase
            .from('calendar_recurring_patterns')
            .insert(fullPayload)
            .select('id')
            .single();
          if (!error) return data.id;

          if (isColumnError(error)) {
            const { data: fallback, error: fallbackErr } = await supabase
              .from('calendar_recurring_patterns')
              .insert(basePayload)
              .select('id')
              .single();
            if (fallbackErr) throw fallbackErr;
            return fallback.id;
          }
          throw error;
        };

        const updatePattern = async (patternId: string): Promise<void> => {
          const fullPayload = { ...basePayload, ...extendedFields };
          const { error } = await supabase
            .from('calendar_recurring_patterns')
            .update(fullPayload)
            .eq('id', patternId);
          if (!error) return;

          if (isColumnError(error)) {
            const { error: fallbackErr } = await supabase
              .from('calendar_recurring_patterns')
              .update(basePayload)
              .eq('id', patternId);
            if (fallbackErr) throw fallbackErr;
            return;
          }
          throw error;
        };

        const GENERATION_DAYS = 180;

        const generateOccurrenceDates = (): string[] => {
          const startDate = new Date(startsOn + 'T00:00:00Z');
          const endLimit = formData.end_date
            ? new Date(formData.end_date + 'T23:59:59Z')
            : new Date(startDate.getTime() + GENERATION_DAYS * 86400000);
          const interval = Math.max(1, formData.interval || 1);
          const dates: string[] = [];

          if (formData.pattern_type === 'daily') {
            for (let d = new Date(startDate); d <= endLimit; d.setUTCDate(d.getUTCDate() + 1)) {
              const diff = Math.floor((d.getTime() - startDate.getTime()) / 86400000);
              if (diff >= 0 && diff % interval === 0) {
                dates.push(d.toISOString().split('T')[0]);
              }
            }
          } else if (formData.pattern_type === 'weekly') {
            const allowedJs = formData.days_of_week;
            for (let d = new Date(startDate); d <= endLimit; d.setUTCDate(d.getUTCDate() + 1)) {
              if (!allowedJs.includes(d.getUTCDay())) continue;
              const diff = Math.floor((d.getTime() - startDate.getTime()) / 86400000);
              if (diff < 0) continue;
              const weekDiff = Math.floor(diff / 7);
              if (weekDiff % interval !== 0) continue;
              dates.push(d.toISOString().split('T')[0]);
            }
          } else {
            const startDay = startDate.getUTCDate();
            for (let cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
              cursor <= endLimit;
              cursor.setUTCMonth(cursor.getUTCMonth() + 1)) {
              const monthDiff = (cursor.getUTCFullYear() - startDate.getUTCFullYear()) * 12 + (cursor.getUTCMonth() - startDate.getUTCMonth());
              if (monthDiff < 0 || monthDiff % interval !== 0) continue;
              const maxDay = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
              const target = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), Math.min(startDay, maxDay)));
              if (target >= startDate && target <= endLimit) {
                dates.push(target.toISOString().split('T')[0]);
              }
            }
          }

          return dates;
        };

        const buildEventForDate = (dateKey: string, patternId: string): Omit<CalendarEvent, 'id'> => {
          const timePart = formData.start_time.split('T')[1] || '00:00';
          const endTimePart = formData.end_time.split('T')[1] || '00:00';
          const evStart = new Date(`${dateKey}T${timePart}`);
          const evEnd = new Date(`${dateKey}T${endTimePart}`);
          if (evEnd <= evStart) evEnd.setDate(evEnd.getDate() + 1);

          return {
            title: eventData.title,
            description: eventData.description,
            start_time: evStart.toISOString(),
            end_time: evEnd.toISOString(),
            instructor_id: eventData.instructor_id,
            class_type: eventData.class_type,
            capacity: eventData.capacity,
            recurring_pattern_id: patternId,
          };
        };

        const generateSeriesEvents = async (patternId: string): Promise<number> => {
          const dates = generateOccurrenceDates();
          if (dates.length === 0) return 0;

          const payloads = dates.map((dateKey) => {
            const ev = buildEventForDate(dateKey, patternId);
            return {
              title: ev.title,
              description: ev.description,
              start_time: ev.start_time,
              end_time: ev.end_time,
              instructor_id: ev.instructor_id,
              class_type: ev.class_type,
              capacity: ev.capacity,
              recurring_pattern_id: ev.recurring_pattern_id,
            };
          });

          const BATCH = 50;
          for (let i = 0; i < payloads.length; i += BATCH) {
            const batch = payloads.slice(i, i + BATCH);
            const { error: batchErr } = await supabase
              .from('calendar_events')
              .insert(batch);
            if (batchErr) throw batchErr;
          }

          return payloads.length;
        };

        const deleteExistingSeriesEvents = async (patternId: string) => {
          const { data, error: fetchErr } = await supabase
            .from('calendar_events')
            .select('id')
            .eq('recurring_pattern_id', patternId);
          if (fetchErr) throw fetchErr;

          const ids = (data || []).map((r) => r.id);
          if (ids.length === 0) return;

          const BATCH = 50;
          for (let i = 0; i < ids.length; i += BATCH) {
            const batch = ids.slice(i, i + BATCH);
            const { error: delErr } = await supabase
              .from('calendar_events')
              .delete()
              .in('id', batch);
            if (delErr) throw delErr;
          }
        };

        if (editingEvent?.recurring_pattern_id) {
          const patternId = editingEvent.recurring_pattern_id;
          await updatePattern(patternId);

          try {
            const syncResult = await syncRecurringPattern(patternId);
            showSuccess(
              `Recurring event synced. Generated ${syncResult.generatedCount}, replaced ${syncResult.deletedUnbookedCount}, preserved ${syncResult.preservedBookedCount}.`
            );
          } catch {
            await deleteExistingSeriesEvents(patternId);
            const count = await generateSeriesEvents(patternId);
            showSuccess(`Recurring pattern updated. Generated ${count} event(s).`);
          }
          await logEventAction('update', patternId, formData.title);
        } else {
          const patternId = await insertPattern();

          if (editingEvent) {
            const occurrenceDate = startsOn;
            const bookedCount = await getBookedCount(editingEvent.id);
            if (bookedCount > 0) {
              await updateEvent(editingEvent.id, {
                ...eventData,
                recurring_pattern_id: null,
                recurring_series_id: patternId,
                occurrence_date: occurrenceDate,
                is_recurring_generated: false,
                is_recurring_preserved: true
              });
            } else {
              await deleteEvent(editingEvent.id);
            }
          }

          try {
            const syncResult = await syncRecurringPattern(patternId);
            if (editingEvent) {
              await removeGeneratedOccurrence(patternId, startsOn);
            }
            showSuccess(
              `Recurring event created. Generated ${syncResult.generatedCount}, replaced ${syncResult.deletedUnbookedCount}, preserved ${syncResult.preservedBookedCount}.`
            );
          } catch {
            const count = await generateSeriesEvents(patternId);
            showSuccess(`Recurring series created. Generated ${count} event(s) across your calendar.`);
          }
          await logEventAction('create', patternId, formData.title);
        }

        await refreshEvents();
        setIsModalOpen(false);
        return;
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        await logEventAction('update', editingEvent.id, formData.title);
        showSuccess('Event updated successfully!');
      } else {
        await addEvent(eventData);
        await logEventAction('create', `event-${Date.now()}`, formData.title);
        showSuccess('Event added successfully!');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      showError('Failed to save event.');
    }
  };

  const handleDelete = async (id: string) => {
    const event = baseEvents.find((item) => item.id === id) || events.find((item) => item.id === id);
    if (event && event.class_type === 'holiday') {
      showError('Holidays are automatically generated and cannot be deleted.');
      setDeleteConfirm({ isOpen: false, eventId: null });
      return;
    }

    try {
      await deleteEvent(id);
      if (event) {
        await logEventAction('delete', id, event.title);
      }
      showSuccess('Event deleted successfully!');
      setDeleteConfirm({ isOpen: false, eventId: null });
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Failed to delete event.');
      setDeleteConfirm({ isOpen: false, eventId: null });
    }
  };

  const classTypes = [
    { value: 'community', label: 'Community' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'fundraisers', label: 'Fundraisers' },
    { value: 'self_help', label: 'Self Help' }
  ];

  const instructorNameById = useMemo(() => {
    return new Map(instructors.map((item) => [item.id, item.name]));
  }, [instructors]);

  const allowedTypes = ['community', 'outreach', 'fundraisers', 'self_help', 'holiday'];
  const tableEvents = (baseEvents.length > 0 ? baseEvents : events)
    .filter((event) => !event.is_recurring_generated || event.is_recurring_preserved || event.class_type === 'holiday');
  const filteredEvents = tableEvents
    .filter((event) => allowedTypes.includes(event.class_type?.toLowerCase()))
    .filter((event) => {
      const matchesClassType = filterClassType === 'all' || event.class_type === filterClassType;
      const matchesSearch = searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClassType && matchesSearch;
    });

  return (
    <div className="space-y-8 fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold dark:text-white">Calendar Management</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Manage single events, recurring schedules, instructors, and booking oversight.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'events'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'recurring'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Recurring
        </button>
        <button
          onClick={() => setActiveTab('instructors')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'instructors'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Instructors
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Bookings
        </button>
      </div>

      {activeTab === 'recurring' && <RecurringEventsManager onPatternsChanged={refreshEvents} />}
      {activeTab === 'instructors' && <InstructorsManager />}
      {activeTab === 'bookings' && <BookingOversightManager />}

      {activeTab === 'events' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg w-full sm:w-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> US Federal Holidays are auto-generated. Manage recurring series from the Recurring tab.
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Event
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
            />
            <select
              value={filterClassType}
              onChange={(e) => setFilterClassType(e.target.value)}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="community">Community</option>
              <option value="outreach">Outreach</option>
              <option value="fundraisers">Fundraisers</option>
              <option value="self_help">Self Help</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          {isLoading ? (
            <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
              <p className="mt-4 text-neutral-500 dark:text-neutral-400">Loading events...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                    <tr>
                      <th className="p-4 font-bold text-sm dark:text-white">Title</th>
                      <th className="p-4 font-bold text-sm dark:text-white">Type</th>
                      <th className="p-4 font-bold text-sm dark:text-white">Instructor</th>
                      <th className="p-4 font-bold text-sm dark:text-white">Start Time</th>
                      <th className="p-4 font-bold text-sm dark:text-white">End Time</th>
                      <th className="p-4 font-bold text-sm dark:text-white">Capacity</th>
                      <th className="p-4 font-bold text-sm text-right dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500">
                          {tableEvents.length === 0
                            ? 'No events found. Create your first event to get started.'
                            : 'No events match your filters.'}
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((event) => {
                        const isHoliday = event.class_type === 'holiday';
                        return (
                          <tr key={event.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${isHoliday ? 'opacity-75' : ''}`}>
                            <td className="p-4 font-bold text-sm dark:text-white">
                              {event.title}
                              {isHoliday && <span className="ml-2 text-xs text-neutral-400">(Auto-generated)</span>}
                              {event.recurring_pattern_id && <span className="ml-2 text-xs font-normal text-brand-red">(Recurring)</span>}
                              {event.is_recurring_preserved && <span className="ml-2 text-xs font-normal text-amber-600">(Preserved)</span>}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-neutral-100 dark:bg-neutral-900 dark:text-white">
                                {formatClassType(event.class_type)}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                              {event.instructor_id ? instructorNameById.get(event.instructor_id) || 'Unknown' : '—'}
                            </td>
                            <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                              {new Date(event.start_time).toLocaleString()}
                            </td>
                            <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                              {new Date(event.end_time).toLocaleString()}
                            </td>
                            <td className="p-4 text-sm dark:text-white">
                              {event.capacity || 'Unlimited'}
                            </td>
                            <td className="p-4 text-right space-x-3">
                              {!isHoliday && (
                                <>
                                  <button
                                    onClick={() => openModal(event)}
                                    className="text-brand-charcoal dark:text-white font-bold text-xs uppercase hover:text-brand-red transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ isOpen: true, eventId: event.id })}
                                    className="text-red-500 font-bold text-xs uppercase hover:text-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              {isHoliday && (
                                <span className="text-xs text-neutral-400 italic">Read-only</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Event Type</label>
                  <select
                    value={formData.class_type}
                    onChange={(e) => setFormData({ ...formData, class_type: e.target.value as 'community' | 'outreach' | 'fundraisers' | 'self_help' })}
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  >
                    {classTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Instructor</label>
                <select
                  value={formData.instructor_id}
                  onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              {isSupabaseConfigured() && (
                <div className="space-y-3 pt-4 border-t dark:border-neutral-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm font-bold dark:text-neutral-300">Recurring event</span>
                  </label>
                  {formData.isRecurring && (
                    <div className="space-y-3 pl-6 border-l-2 border-brand-red/30">
                      <div>
                        <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Repeats</label>
                        <select
                          value={formData.pattern_type}
                          onChange={(e) => setFormData({ ...formData, pattern_type: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                          className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Every</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.interval}
                          onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value, 10) || 1 })}
                          className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                        />
                      </div>
                      {formData.pattern_type === 'weekly' && (
                        <div>
                          <label className="block text-sm font-bold mb-2 dark:text-neutral-300">Days</label>
                          <div className="flex flex-wrap gap-2">
                            {DAYS.map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleDayOfWeek(index)}
                                className={`px-2 py-1 rounded text-sm font-bold ${
                                  formData.days_of_week.includes(index)
                                    ? 'bg-brand-red text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-700 dark:text-white'
                                }`}
                              >
                                {day.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-bold mb-1 dark:text-neutral-300">End date (optional)</label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-neutral-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-brand-charcoal dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm.eventId && handleDelete(deleteConfirm.eventId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, eventId: null })}
        variant="danger"
      />
    </div>
  );
};

export default CalendarManager;
