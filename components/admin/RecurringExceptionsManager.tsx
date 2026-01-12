import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';
import ConfirmDialog from '../ConfirmDialog';

interface RecurringException {
  id: string;
  recurring_pattern_id: string;
  exception_date: string;
  reason: string | null;
}

interface RecurringExceptionsManagerProps {
  patternId: string;
  patternName: string;
}

const RecurringExceptionsManager: React.FC<RecurringExceptionsManagerProps> = ({
  patternId,
  patternName
}) => {
  const { showSuccess, showError } = useToast();
  const [exceptions, setExceptions] = useState<RecurringException[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; exceptionId: string | null }>({
    isOpen: false,
    exceptionId: null
  });

  useEffect(() => {
    loadExceptions();
  }, [patternId]);

  const loadExceptions = async () => {
    if (!isSupabaseConfigured() || !patternId) return;

    try {
      const { data, error } = await supabase
        .from('calendar_recurring_exceptions')
        .select('*')
        .eq('recurring_pattern_id', patternId)
        .order('exception_date', { ascending: true });

      if (error) throw error;
      if (data) setExceptions(data);
    } catch (error) {
      console.error('Error loading exceptions:', error);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured() || !patternId || !exceptionDate) return;

    try {
      const { error } = await supabase
        .from('calendar_recurring_exceptions')
        .insert({
          recurring_pattern_id: patternId,
          exception_date: exceptionDate,
          reason: exceptionReason || null
        });

      if (error) throw error;
      showSuccess('Exception date added successfully!');
      setIsModalOpen(false);
      setExceptionDate('');
      setExceptionReason('');
      await loadExceptions();
    } catch (error: any) {
      console.error('Error adding exception:', error);
      if (error.code === '23505') {
        showError('This date is already marked as an exception');
      } else {
        showError('Failed to add exception date.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('calendar_recurring_exceptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess('Exception removed successfully!');
      setDeleteConfirm({ isOpen: false, exceptionId: null });
      await loadExceptions();
    } catch (error) {
      console.error('Error deleting exception:', error);
      showError('Failed to delete exception.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold dark:text-white">Exception Dates (Skip These Dates)</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
        >
          Add Exception
        </Button>
      </div>

      {exceptions.length === 0 ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          No exception dates. All dates in the pattern will generate events.
        </p>
      ) : (
        <div className="space-y-2">
          {exceptions.map(exception => (
            <div
              key={exception.id}
              className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded border border-neutral-200 dark:border-neutral-700 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-bold dark:text-white">
                  {new Date(exception.exception_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                {exception.reason && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {exception.reason}
                  </p>
                )}
              </div>
              <button
                onClick={() => setDeleteConfirm({ isOpen: true, exceptionId: exception.id })}
                className="text-red-500 hover:text-red-700 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Exception Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add Exception Date</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Skip this date in the recurring pattern: <strong>{patternName}</strong>
            </p>
            <form onSubmit={handleAddException} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Date to Skip</label>
                <input
                  type="date"
                  required
                  value={exceptionDate}
                  onChange={(e) => setExceptionDate(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Reason (Optional)</label>
                <input
                  type="text"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  placeholder="e.g., Holiday, Maintenance"
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setExceptionDate('');
                    setExceptionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  className="flex-1"
                >
                  Add Exception
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Remove Exception Date"
        message="Are you sure you want to remove this exception? Events will be generated for this date again."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm.exceptionId && handleDelete(deleteConfirm.exceptionId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, exceptionId: null })}
        variant="danger"
      />
    </div>
  );
};

export default RecurringExceptionsManager;
