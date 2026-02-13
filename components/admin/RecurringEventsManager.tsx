import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import RecurringExceptionsManager from './RecurringExceptionsManager';

interface RecurringPatternWithTitle {
  id: string;
  pattern_type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  days_of_week: number[] | null;
  end_date: string | null;
  event_title?: string;
}

const RecurringEventsManager: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [patterns, setPatterns] = useState<RecurringPatternWithTitle[]>([]);
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);

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
        .select('*')
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
        event_title: titleByPattern.get(p.id) || '(No linked event)'
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

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold dark:text-white">Manage Recurring Event Exceptions</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Skip specific dates for recurring events. Create recurring events in the Events tab.
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
                      <span> — Days: {pattern.days_of_week.map((d) => DAYS[d]).join(', ')}</span>
                    )}
                  </p>
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
                    patternName={pattern.event_title || `${pattern.pattern_type} (every ${pattern.interval})`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RecurringEventsManager;
