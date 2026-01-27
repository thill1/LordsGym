import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Testimonial } from '../../types';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';
import ConfirmDialog from '../ConfirmDialog';

const TestimonialsManager: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useStore();
  const { showSuccess, showError } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', quote: '' });
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        quote: testimonial.quote
      });
    } else {
      setEditingTestimonial(null);
      setFormData({ name: '', role: '', quote: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData({ name: '', role: '', quote: '' });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role || !formData.quote) {
      showError('Please fill in all fields');
      return;
    }

    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData);
        showSuccess('Testimonial updated successfully');
      } else {
        const newTestimonial: Testimonial = {
          id: Date.now(), // Simple ID generation
          name: formData.name,
          role: formData.role,
          quote: formData.quote
        };
        await addTestimonial(newTestimonial);
        showSuccess('Testimonial added successfully');
      }
      closeModal();
    } catch (error) {
      showError('Failed to save testimonial');
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTestimonial(id);
      showSuccess('Testimonial deleted successfully');
      setConfirmDialog({ isOpen: false, id: null });
    } catch (error) {
      showError('Failed to delete testimonial');
      console.error('Error deleting testimonial:', error);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Testimonials</h1>
        <Button onClick={() => openModal()} size="sm">
          Add Testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
          <p className="text-neutral-500 dark:text-neutral-400">No testimonials yet. Add your first one!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="p-4 font-bold text-sm dark:text-white">Name</th>
                  <th className="p-4 font-bold text-sm dark:text-white">Role</th>
                  <th className="p-4 font-bold text-sm dark:text-white">Quote</th>
                  <th className="p-4 font-bold text-sm text-right dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {testimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="p-4 font-bold text-sm dark:text-white">{testimonial.name}</td>
                    <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">{testimonial.role}</td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300 max-w-md">
                      <p className="line-clamp-2">{testimonial.quote}</p>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => openModal(testimonial)}
                        className="text-brand-charcoal dark:text-white font-bold text-xs uppercase hover:text-brand-red transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ isOpen: true, id: testimonial.id })}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Role</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Member"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Quote</label>
                <textarea
                  rows={4}
                  required
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="This gym has changed my life..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-neutral-700 mt-6">
              <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSave}>
                {editingTestimonial ? 'Update' : 'Add'} Testimonial
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && confirmDialog.id !== null && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Testimonial"
          message="Are you sure you want to delete this testimonial? This action cannot be undone."
          onConfirm={() => handleDelete(confirmDialog.id!)}
          onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
          variant="danger"
        />
      )}
    </div>
  );
};

export default TestimonialsManager;
