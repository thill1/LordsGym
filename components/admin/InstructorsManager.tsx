import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';
import ConfirmDialog from '../ConfirmDialog';

interface Instructor {
  id: string;
  name: string;
  email: string | null;
  bio: string | null;
  image_url: string | null;
}

const emptyForm = {
  name: '',
  email: '',
  bio: '',
  image_url: ''
};

const InstructorsManager: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; instructorId: string | null }>({
    isOpen: false,
    instructorId: null
  });

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    if (!isSupabaseConfigured()) {
      setInstructors([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
      showError('Failed to load instructors.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingInstructor(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email || '',
      bio: instructor.bio || '',
      image_url: instructor.image_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        bio: formData.bio.trim() || null,
        image_url: formData.image_url.trim() || null
      };

      if (editingInstructor) {
        const { error } = await supabase
          .from('instructors')
          .update(payload)
          .eq('id', editingInstructor.id);
        if (error) throw error;
        showSuccess('Instructor updated successfully.');
      } else {
        const { error } = await supabase
          .from('instructors')
          .insert(payload);
        if (error) throw error;
        showSuccess('Instructor created successfully.');
      }

      setIsModalOpen(false);
      await loadInstructors();
    } catch (error) {
      console.error('Error saving instructor:', error);
      showError('Failed to save instructor.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('instructors')
        .delete()
        .eq('id', id);
      if (error) throw error;

      showSuccess('Instructor deleted successfully.');
      setDeleteConfirm({ isOpen: false, instructorId: null });
      await loadInstructors();
    } catch (error) {
      console.error('Error deleting instructor:', error);
      showError('Failed to delete instructor.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold dark:text-white">Instructor Management</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Create and manage instructors that can be assigned to events.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal}>
          Add Instructor
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading instructors...</p>
        </div>
      ) : instructors.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No instructors found. Add your first instructor to start assigning classes.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="p-4 text-sm font-bold dark:text-white">Name</th>
                  <th className="p-4 text-sm font-bold dark:text-white">Email</th>
                  <th className="p-4 text-sm font-bold dark:text-white">Bio</th>
                  <th className="p-4 text-sm font-bold text-right dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {instructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="p-4 text-sm font-bold dark:text-white">{instructor.name}</td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300">{instructor.email || '—'}</td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300 max-w-md truncate">
                      {instructor.bio || '—'}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(instructor)}
                        className="text-brand-charcoal dark:text-white font-bold text-xs uppercase hover:text-brand-red transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, instructorId: instructor.id })}
                        className="text-red-500 font-bold text-xs uppercase hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {editingInstructor ? 'Edit Instructor' : 'Add Instructor'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Profile Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
                <Button type="submit" variant="brand" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Instructor"
        message="Are you sure you want to delete this instructor? Existing events will keep a null instructor."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm.instructorId && handleDelete(deleteConfirm.instructorId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, instructorId: null })}
        variant="danger"
      />
    </div>
  );
};

export default InstructorsManager;
