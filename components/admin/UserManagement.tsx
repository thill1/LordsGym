import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'member';
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      // Note: This requires a custom function or direct auth.users access
      // For now, we'll show a message that this requires backend setup
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'member') => {
    if (!isSupabaseConfigured()) return;

    try {
      // Update user role in auth.users metadata
      // This requires a server-side function or admin API
      alert('Role update requires backend implementation');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role.');
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">User Management</h1>
        <button className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors">
          Add User
        </button>
      </div>

      {!isSupabaseConfigured() ? (
        <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            User management requires Supabase backend configuration.
          </p>
          <p className="text-sm text-neutral-400">
            Set up your Supabase project and configure user roles in the database.
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-neutral-500 dark:text-neutral-400">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="p-4 font-bold text-sm dark:text-white">Email</th>
                  <th className="p-4 font-bold text-sm dark:text-white">Role</th>
                  <th className="p-4 font-bold text-sm dark:text-white">Created</th>
                  <th className="p-4 font-bold text-sm text-right dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-500">
                      No users found. User management requires backend setup.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                      <td className="p-4 font-bold text-sm dark:text-white">{user.email}</td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'editor' | 'member')}
                          className="px-2 py-1 border rounded text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                        >
                          <option value="member">Member</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button className="text-red-500 hover:text-red-700 text-sm font-bold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
