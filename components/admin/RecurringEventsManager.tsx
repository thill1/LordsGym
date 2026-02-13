import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../ConfirmDialog';
import Button from '../Button';
import RecurringExceptionsManager from './RecurringExceptionsManager';

interface RecurringPattern {
  id: string;
  pattern_type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  days_of_week: number[] | null;
  end_date: string | null;
}

const RecurringEventsManager: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<RecurringPattern | null>(null);
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    pattern_type: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    days_of_week: [] as number[],
    end_date: ''
  });

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    if (!isSupabaseConfigured()) {
      setPatterns([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calendar_recurring_patterns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPatterns(data);
    } catch (error) {
      console.error('Error loading recurring patterns:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      showError('Supabase is not configured. Please configure your database connection in Settings.');
      return;
    }

    // For weekly patterns, require at least one day
    if (formData.pattern_type === 'weekly' && formData.days_of_week.length === 0) {
      showError('Please select at least one day of the week for weekly patterns.');
      return;
    }

    try {
      const patternData = {
        pattern_type: formData.pattern_type,
        interval: formData.interval,
        days_of_week: formData.pattern_type === 'weekly' ? formData.days_of_week : null,
        end_date: formData.end_date || null
      };

      if (editingPattern) {
        const { error } = await supabase
          .from('calendar_recurring_patterns')
          .update(patternData)
          .eq('id', editingPattern.id);

        if (error) throw error;
        showSuccess('Recurring pattern updated successfully!');
      } else {
        const { error } = await supabase
          .from('calendar_recurring_patterns')
          .insert(patternData);

        if (error) throw error;
        showSuccess('Recurring pattern created successfully!');
      }

      setIsModalOpen(false);
      await loadPatterns();
    } catch (error: unknown) {
      console.error('Error saving pattern:', error);
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Failed to save recurring pattern.';
      showError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured()) {
      showError('Supabase is not configured. Please configure your database connection in Settings.');
      return;
    }

    try {
      const { error } = await supabase
        .from('calendar_recurring_patterns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess('Recurring pattern deleted successfully!');
      await loadPatterns();
    } catch (error) {
      console.error('Error deleting pattern:', error);
      showError('Failed to delete recurring pattern.');
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold dark:text-white">Recurring Event Patterns</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingPattern(null);
            setFormData({
              pattern_type: 'weekly',
              interval: 1,
              days_of_week: [],
              end_date: ''
            });
            setIsModalOpen(true);
          }}
        >
          Add Pattern
        </Button>
      </div>

      {patterns.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No recurring patterns. Create one to automatically generate events.
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
                  <p className="font-bold text-sm dark:text-white">
                    {pattern.pattern_type.charAt(0).toUpperCase() + pattern.pattern_type.slice(1)} 
                    {' '}(every {pattern.interval} {pattern.interval === 1 ? pattern.pattern_type.slice(0, -2) : pattern.pattern_type})
                  </p>
                  {pattern.days_of_week && pattern.days_of_week.length > 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Days: {pattern.days_of_week.map(d => DAYS[d]).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
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
                    patternName={`${pattern.pattern_type} (every ${pattern.interval})`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pattern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {editingPattern ? 'Edit' : 'Create'} Recurring Pattern
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Pattern Type</label>
                <select
                  value={formData.pattern_type}
                  onChange={(e) => setFormData({ ...formData, pattern_type: e.target.value as any })}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Interval</label>
                <input
                  type="number"
                  min="1"
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Repeat every {formData.interval} {formData.interval === 1 ? formData.pattern_type.slice(0, -2) : formData.pattern_type}
                </p>
              </div>

              {formData.pattern_type === 'weekly' && (
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-neutral-300">Days of Week</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDayOfWeek(index)}
                        className={`p-2 rounded border text-sm font-bold transition-colors ${
                          formData.days_of_week.includes(index)
                            ? 'bg-brand-red text-white border-brand-red'
                            : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 dark:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  className="flex-1"
                >
                  Save Pattern
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringEventsManager;
