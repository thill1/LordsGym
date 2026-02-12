import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { EntityType, ActionType } from '../../lib/activity-logger';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action_type: ActionType;
  entity_type: EntityType;
  entity_id: string | null;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
  user_email?: string;
}

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<{ entityType?: EntityType; actionType?: ActionType }>({});

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter.entityType) {
        query = query.eq('entity_type', filter.entityType);
      }
      if (filter.actionType) {
        query = query.eq('action_type', filter.actionType);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Use metadata.user_email (stored at insert) - auth.admin requires service_role
        setLogs(data.map(log => ({
          ...log,
          user_email: log.metadata?.user_email ?? (log.user_id ? 'Unknown' : 'System')
        })));
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: ActionType): string => {
    const colors: Record<ActionType, string> = {
      create: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      login: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200',
      logout: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-200',
      view: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      export: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
    };
    return colors[action] || 'bg-neutral-100 text-neutral-800';
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
        <p className="text-neutral-500 dark:text-neutral-400">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Activity Logs</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm flex gap-4 items-center">
        <select
          value={filter.entityType || ''}
          onChange={(e) => setFilter({ ...filter, entityType: e.target.value as EntityType || undefined })}
          className="px-4 py-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
        >
          <option value="">All Entity Types</option>
          <option value="product">Products</option>
          <option value="page">Pages</option>
          <option value="event">Events</option>
          <option value="user">Users</option>
          <option value="testimonial">Testimonials</option>
          <option value="media">Media</option>
          <option value="settings">Settings</option>
          <option value="calendar_booking">Bookings</option>
        </select>
        <select
          value={filter.actionType || ''}
          onChange={(e) => setFilter({ ...filter, actionType: e.target.value as ActionType || undefined })}
          className="px-4 py-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="view">View</option>
          <option value="export">Export</option>
        </select>
        <button
          onClick={() => setFilter({})}
          className="px-4 py-2 text-sm border rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:text-white"
        >
          Clear Filters
        </button>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
            No activity logs found.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getActionColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                        {log.entity_type}
                      </span>
                    </div>
                    <p className="text-sm font-bold dark:text-white mb-1">{log.description}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {log.user_email} • {new Date(log.created_at).toISOString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
