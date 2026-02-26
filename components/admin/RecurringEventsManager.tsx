import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { toJsDay } from '../../lib/calendar-utils';
import { useToast } from '../../context/ToastContext';
import { deleteRecurringPatternSafely, syncRecurringPattern } from '../../lib/recurring-events';
import RecurringExceptionsManager from './RecurringExceptionsManager';

interface RecurringPatternWithTitle {
  id: string;
  pattern_type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  days_of_week: number[] | null;
  end_date: string | null;
  title: string;
  description: string | null;
  class_type: string;
  instructor_id: string | null;
  capacity: number | null;
  timezone: string;
  is_active: boolean;
  starts_on: string;
  start_time_local: string;
  end_time_local: string;
  event_title?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const emptyEditForm = {
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  class_type: 'community' as 'community' | 'outreach' | 'fundraisers' | 'self_help',
  capacity: '',
  instructor_id: '',
  pattern_type: 'weekly' as 'daily' | 'weekly' | 'monthly',
  interval: 1,
  days_of_week: [] as number[],
  end_date: ''
};

interface RecurringEventsManagerProps {
  onPatternsChanged?: () => Promise<void> | void;
}

const RecurringEventsManager: React.FC<RecurringEventsManagerProps> = ({ onPatternsChanged }) => {
  const { showSuccess, showError } = useToast();
  const [patterns, setPatterns] = useState<RecurringPatternWithTitle[]>([]);
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);
  const [editingPattern, setEditingPattern] = useState<RecurringPatternWithTitle | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [instructors, setInstructors] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    if (!isSupabaseConfigured()) {
      setPatterns([]);
      return;
    }

    try {
      const { data: patternsData, error: patternsErr } = await supabase
        .from('calendar_recurring_patterns')
        .select('id, pattern_type, interval, days_of_week, end_date, title, description, class_type, instructor_id, capacity, timezone, is_active, starts_on, start_time_local, end_time_local')
        .order('created_at', { ascending: false });

      if (patternsErr) throw patternsErr;

      const { data: eventsData } = await supabase
        .from('calendar_events')
        .select('id, title, recurring_pattern_id')
        .not('recurring_pattern_id', 'is', null);

      const titleByPattern = new Map<string, string>();
      (eventsData || []).forEach((e) => {
        if (e.recurring_pattern_id) titleByPattern.set(e.recurring_pattern_id, e.title);
      });

      const combined = (patternsData || []).map((p) => ({
        ...p,
        event_title: p.title || titleByPattern.get(p.id) || '(No linked event)'
      }));
      setPatterns(combined);
    } catch (error) {
      console.error('Error loading recurring patterns:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured()) {
      showError('Supabase is not configured. Please configure your database connection in Settings.');
      return;
    }

    try {
      const result = await deleteRecurringPatternSafely(id);
      showSuccess(
        `Recurring pattern deleted. Removed ${result.deletedUnbookedCount} unbooked occurrences and preserved ${result.preservedBookedCount} booked occurrences.`
      );
      await loadPatterns();
      if (onPatternsChanged) await onPatternsChanged();
    } catch (error) {
      console.error('Error deleting pattern:', error);
      showError('Failed to delete recurring pattern.');
    }
  };

  const handleToggleActive = async (pattern: RecurringPatternWithTitle) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('calendar_recurring_patterns')
        .update({ is_active: !pattern.is_active })
        .eq('id', pattern.id);

      if (error) throw error;

      const syncResult = await syncRecurringPattern(pattern.id);
      showSuccess(
        `${!pattern.is_active ? 'Activated' : 'Paused'} recurring series. Generated ${syncResult.generatedCount}, replaced ${syncResult.deletedUnbookedCount}, preserved ${syncResult.preservedBookedCount}.`
      );
      await loadPatterns();
      if (onPatternsChanged) await onPatternsChanged();
    } catch (error) {
      console.error('Error toggling recurring pattern:', error);
      showError('Failed to update recurring pattern status.');
    }
  };

  const handleResync = async (patternId: string) => {
    try {
      const result = await syncRecurringPattern(patternId);
      showSuccess(`Re-synced pattern: ${result.generatedCount} generated, ${result.deletedUnbookedCount} replaced, ${result.preservedBookedCount} preserved.`);
      await loadPatterns();
      if (onPatternsChanged) await onPatternsChanged();
    } catch (error) {
      console.error('Error syncing recurring pattern:', error);
      showError('Failed to sync recurring pattern.');
    }
  };

  const loadInstructors = async () => {
    if (!isSupabaseConfigured()) return;
    const { data } = await supabase.from('instructors').select('id, name').order('name', { ascending: true });
    setInstructors(data || []);
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const openEditModal = (pattern: RecurringPatternWithTitle) => {
    const st = pattern.start_time_local?.slice(0, 5) || '09:00';
    const et = pattern.end_time_local?.slice(0, 5) || '10:00';
    setEditingPattern(pattern);
    setEditForm({
      title: pattern.title || '',
      description: pattern.description || '',
      start_time: `${pattern.starts_on}T${st}`,
      end_time: `${pattern.starts_on}T${et}`,
      class_type: (pattern.class_type as 'community' | 'outreach' | 'fundraisers' | 'self_help') || 'community',
      capacity: pattern.capacity?.toString() || '',
      instructor_id: pattern.instructor_id || '',
      pattern_type: pattern.pattern_type || 'weekly',
      interval: pattern.interval || 1,
      days_of_week: pattern.days_of_week || [],
      end_date: pattern.end_date ? pattern.end_date.slice(0, 10) : ''
    });
  };

  const closeEditModal = () => {
    setEditingPattern(null);
    setEditForm(emptyEditForm);
  };

  const toggleEditDay = (day: number) => {
    setEditForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const normalizeTimePart = (dateTime: string): string => {
    const part = dateTime.split('T')[1] || '00:00';
    return part.length === 5 ? `${part}:00` : part;
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPattern || !editForm.start_time || !editForm.end_time) return;
    if (editForm.pattern_type === 'weekly' && editForm.days_of_week.length === 0) {
      showError('Please select at least one day of the week for weekly recurrence.');
      return;
    }
    const startDate = new Date(editForm.start_time);
    const endDate = new Date(editForm.end_time);
    if (endDate <= startDate) {
      showError('End time must be after start time.');
      return;
    }
    try {
      const tz = editingPattern.timezone || 'America/Los_Angeles';
      const { error } = await supabase
        .from('calendar_recurring_patterns')
        .update({
          title: editForm.title.trim(),
          description: editForm.description.trim() || null,
          class_type: editForm.class_type,
          instructor_id: editForm.instructor_id || null,
          capacity: editForm.capacity ? parseInt(editForm.capacity, 10) : null,
          starts_on: editForm.start_time.split('T')[0],
          start_time_local: normalizeTimePart(editForm.start_time),
          end_time_local: normalizeTimePart(editForm.end_time),
          timezone: tz,
          pattern_type: editForm.pattern_type,
          interval: Math.max(1, editForm.interval),
          days_of_week: editForm.pattern_type === 'weekly' ? editForm.days_of_week : null,
          end_date: editForm.end_date ? `${editForm.end_date}T23:59:59.000Z` : null
        })
        .eq('id', editingPattern.id);
      if (error) throw error;
      const syncResult = await syncRecurringPattern(editingPattern.id);
      showSuccess(`Recurring event updated. ${syncResult.generatedCount} generated, ${syncResult.deletedUnbookedCount} replaced, ${syncResult.preservedBookedCount} preserved.`);
      closeEditModal();
      await loadPatterns();
      if (onPatternsChanged) await onPatternsChanged();
    } catch (err) {
      console.error('Error updating recurring pattern:', err);
      showError('Failed to update recurring event.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold dark:text-white">Manage Recurring Event Exceptions</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Pause, re-sync, delete, or add exception dates for recurring series. Create recurring events in the Events tab.
        </p>
      </div>

      {patterns.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No recurring events. Create one in the Events tab by checking &quot;Recurring event&quot; when adding an event.
        </p>
      ) : (
        <div className="space-y-2">
          {patterns.map(pattern => (
            <div
              key={pattern.id}
              className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm dark:text-white">{pattern.event_title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {pattern.pattern_type.charAt(0).toUpperCase() + pattern.pattern_type.slice(1)}{' '}
                    (every {pattern.interval} {pattern.interval === 1 ? pattern.pattern_type.slice(0, -2) : pattern.pattern_type})
                    {pattern.days_of_week && pattern.days_of_week.length > 0 && (
                      <span> — Days: {pattern.days_of_week.map((d) => DAYS[toJsDay(Number(d))]).join(', ')}</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Starts: {pattern.starts_on} at {pattern.start_time_local} • {pattern.class_type}
                    {!pattern.is_active && <span className="ml-2 text-amber-600 dark:text-amber-400 font-bold">(Paused)</span>}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => handleToggleActive(pattern)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    {pattern.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(pattern)}
                    className="text-xs font-bold text-brand-charcoal dark:text-white hover:text-brand-red"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleResync(pattern.id)}
                    className="text-xs font-bold text-brand-charcoal dark:text-white hover:text-brand-red"
                  >
                    Re-sync
                  </button>
                  <button
                    onClick={() => setExpandedPatternId(expandedPatternId === pattern.id ? null : pattern.id)}
                    className="text-brand-red hover:text-red-700 text-xs font-bold"
                  >
                    {expandedPatternId === pattern.id ? 'Hide' : 'Manage'} Exceptions
                  </button>
                  <button
                    onClick={() => handleDelete(pattern.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expandedPatternId === pattern.id && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <RecurringExceptionsManager
                    patternId={pattern.id}
                    patternName={pattern.event_title || `${pattern.pattern_type} (every ${pattern.interval})`}
                    onChanged={async () => {
                      await loadPatterns();
                      if (onPatternsChanged) await onPatternsChanged();
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      {editingPattern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Edit Recurring Event</h2>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Title</label>
                <input type="text" required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Start Time</label>
                  <input type="datetime-local" required value={editForm.start_time} onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">End Time</label>
                  <input type="datetime-local" required value={editForm.end_time} onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Event Type</label>
                  <select value={editForm.class_type} onChange={(e) => setEditForm({ ...editForm, class_type: e.target.value as 'community' | 'outreach' | 'fundraisers' | 'self_help' })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
                    <option value="community">Community</option>
                    <option value="outreach">Outreach</option>
                    <option value="fundraisers">Fundraisers</option>
                    <option value="self_help">Self Help</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Capacity</label>
                  <input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} placeholder="Unlimited" className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Instructor</label>
                <select value={editForm.instructor_id} onChange={(e) => setEditForm({ ...editForm, instructor_id: e.target.value })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
                  <option value="">Unassigned</option>
                  {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Repeats</label>
                <select value={editForm.pattern_type} onChange={(e) => setEditForm({ ...editForm, pattern_type: e.target.value as 'daily' | 'weekly' | 'monthly' })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Every</label>
                <input type="number" min={1} value={editForm.interval} onChange={(e) => setEditForm({ ...editForm, interval: parseInt(e.target.value, 10) || 1 })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white" />
              </div>
              {editForm.pattern_type === 'weekly' && (
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-neutral-300">Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day, index) => (
                      <button key={day} type="button" onClick={() => toggleEditDay(index)} className={`px-2 py-1 rounded text-sm font-bold ${editForm.days_of_week.includes(index) ? 'bg-brand-red text-white' : 'bg-neutral-200 dark:bg-neutral-700 dark:text-white'}`}>{day.slice(0, 3)}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">End date (optional)</label>
                <input type="date" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-neutral-700 mt-6">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-brand-charcoal dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecurringEventsManager;
