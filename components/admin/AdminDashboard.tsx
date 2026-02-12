import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ActionType } from '../../lib/activity-logger';

interface RecentActivityLog {
  id: string;
  action_type: ActionType;
  entity_type: string;
  description: string;
  created_at: string;
  metadata?: { user_email?: string } | null;
}

interface AdminDashboardProps {
  onTabChange?: (tab: 'dashboard' | 'home' | 'pages' | 'testimonials' | 'store' | 'calendar' | 'media' | 'users' | 'popups' | 'settings' | 'seo' | 'analytics' | 'activity') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onTabChange }) => {
  const { products, testimonials } = useStore();
  const [recentActivity, setRecentActivity] = useState<RecentActivityLog[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentActivity = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('id, action_type, entity_type, description, created_at, metadata')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        if (data && data.length > 0) {
          setRecentActivity(data);
          setLastUpdated(data[0].created_at);
        }
      } catch (err) {
        console.error('Error loading recent activity:', err);
      }
    };
    loadRecentActivity();
  }, []);

  const formatTimeAgo = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    return `${day}d ago`;
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Overview</h1>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Last activity: {lastUpdated ? new Date(lastUpdated).toISOString() : '—'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-brand-red">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Total Members</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">—</p>
          <p className="text-xs text-neutral-400 mt-1">Coming soon</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Leads (This Week)</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">—</p>
          <p className="text-xs text-neutral-400 mt-1">Coming soon</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Store Products</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{products.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Active products</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Total Revenue</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">$0</p>
          <p className="text-xs text-neutral-400 mt-1">No orders table yet</p>
        </div>
      </div>

      {/* Activity Feed - Real data from activity_logs */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No activity yet.</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                <div>
                  <p className="font-bold text-sm dark:text-white">{log.description}</p>
                  <p className="text-xs text-neutral-500">
                    {log.metadata?.user_email ?? 'System'} • {formatTimeAgo(log.created_at)} • {new Date(log.created_at).toISOString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  log.action_type === 'create' || log.action_type === 'login'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : log.action_type === 'delete'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                }`}>
                  {log.action_type}
                </span>
              </div>
            ))}
          </div>
        )}
        {recentActivity.length > 0 && (
          <button
            onClick={() => onTabChange?.('activity')}
            className="mt-4 text-sm font-bold text-brand-red hover:underline"
          >
            View all activity logs →
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onTabChange?.('store')}
            className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left cursor-pointer"
          >
            <h4 className="font-bold text-sm dark:text-white mb-1">Add New Product</h4>
            <p className="text-xs text-neutral-500">Create a new store item</p>
          </button>
          <button
            onClick={() => onTabChange?.('calendar')}
            className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left cursor-pointer"
          >
            <h4 className="font-bold text-sm dark:text-white mb-1">Schedule Class</h4>
            <p className="text-xs text-neutral-500">Add calendar event</p>
          </button>
          <button
            onClick={() => onTabChange?.('home')}
            className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left cursor-pointer"
          >
            <h4 className="font-bold text-sm dark:text-white mb-1">Edit Home Page</h4>
            <p className="text-xs text-neutral-500">Update hero content</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
