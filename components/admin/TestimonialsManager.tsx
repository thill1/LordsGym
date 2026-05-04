import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Testimonial } from '../../types';
import { useToast } from '../../context/ToastContext';
import { logTestimonialAction } from '../../lib/activity-logger';
import { fetchGoogleReviews, GoogleReviewTestimonial } from '../../lib/google-reviews';
import { getSupabaseUrl } from '../../lib/supabase';
import { MAX_TESTIMONIAL_QUOTE_LENGTH, normalizeTestimonialQuote } from '../../lib/testimonials';
import Button from '../Button';
import ConfirmDialog from '../ConfirmDialog';

const TestimonialsManager: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useStore();
  const manualTestimonials = testimonials.filter((t): t is Testimonial & { id: number } => typeof t.id === 'number');
  const { showSuccess, showError } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', quote: '', published: true });
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  // Import from Google
  const [googleReviews, setGoogleReviews] = useState<GoogleReviewTestimonial[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [showImportedReviews, setShowImportedReviews] = useState(false);

  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      const quote = normalizeTestimonialQuote(testimonial.quote);
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        quote,
        published: testimonial.published !== false
      });
    } else {
      setEditingTestimonial(null);
      setFormData({ name: '', role: '', quote: '', published: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData({ name: '', role: '', quote: '', published: true });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role || !formData.quote) {
      showError('Please fill in all fields');
      return;
    }
    if (formData.quote.length > MAX_TESTIMONIAL_QUOTE_LENGTH) {
      showError(`Quote must be ${MAX_TESTIMONIAL_QUOTE_LENGTH} characters or less (currently ${formData.quote.length})`);
      return;
    }

    try {
      if (editingTestimonial && typeof editingTestimonial.id === 'number') {
        const quote = normalizeTestimonialQuote(formData.quote);
        await updateTestimonial(editingTestimonial.id, {
          name: formData.name.trim(),
          role: formData.role.trim(),
          quote,
          published: formData.published
        });
        await logTestimonialAction('update', editingTestimonial.id, formData.name);
        showSuccess('Testimonial updated successfully');
      } else {
        const quote = normalizeTestimonialQuote(formData.quote);
        const newTestimonial: Testimonial = {
          id: Date.now(),
          name: formData.name.trim(),
          role: formData.role.trim(),
          quote,
          published: formData.published
        };
        await addTestimonial(newTestimonial);
        await logTestimonialAction('create', newTestimonial.id, formData.name);
        showSuccess('Testimonial added successfully');
      }
      closeModal();
    } catch (error) {
      showError('Failed to save testimonial');
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id: number) => {
    const testimonial = manualTestimonials.find(t => t.id === id);
    try {
      await deleteTestimonial(id);
      if (testimonial) await logTestimonialAction('delete', id, testimonial.name);
      showSuccess('Testimonial deleted successfully');
      setConfirmDialog({ isOpen: false, id: null });
    } catch (error) {
      showError('Failed to delete testimonial');
      console.error('Error deleting testimonial:', error);
    }
  };

  const importedExternalIds = new Set(
    manualTestimonials.filter(t => t.externalId).map(t => t.externalId!)
  );
  const availableToImport = googleReviews.filter(r => !importedExternalIds.has(r.id));
  const alreadyImportedReviews = googleReviews.filter(r => importedExternalIds.has(r.id));

  const handleFetchReviews = async () => {
    setIsLoadingReviews(true);
    setGoogleReviews([]);
    setSelectedReviewIds(new Set());
    setShowImportedReviews(false);
    try {
      const reviews = await fetchGoogleReviews(
        getSupabaseUrl(),
        '',
        undefined,
        MAX_TESTIMONIAL_QUOTE_LENGTH
      );
      setGoogleReviews(reviews);
      if (reviews.length === 0) {
        showError('No 5-star reviews found. Verify GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID on the Supabase Edge Function.');
      }
    } catch (error) {
      showError('Failed to fetch Google reviews');
      console.error('Error fetching Google reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const toggleReviewSelection = (id: string) => {
    setSelectedReviewIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImportSelected = async () => {
    if (selectedReviewIds.size === 0) {
      showError('Select at least one review to import');
      return;
    }
    setIsImporting(true);
    const idsToImport = [...selectedReviewIds];
    try {
      const toImport = googleReviews.filter(r => idsToImport.includes(r.id));
      for (const r of toImport) {
        await addTestimonial({
          id: r.id,
          name: r.name,
          role: r.role,
          quote: r.quote,
          source: 'google',
          externalId: r.id,
          published: false   // admin must explicitly publish after review
        });
        await logTestimonialAction('create', r.id, r.name);
      }
      showSuccess(`Imported ${toImport.length} review(s)`);
      setSelectedReviewIds(new Set());
      setGoogleReviews(prev => prev.filter(r => !idsToImport.includes(r.id)));
    } catch (error) {
      showError('Failed to import reviews');
      console.error('Error importing reviews:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleTogglePublish = async (id: number, currentlyPublished: boolean) => {
    try {
      await updateTestimonial(id, { published: !currentlyPublished });
      showSuccess(currentlyPublished ? 'Review moved to drafts' : 'Review published to homepage');
    } catch {
      showError('Failed to update publish status');
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

      {/* Import from Google Reviews */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-bold dark:text-white mb-3">Import from Google Reviews</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Fetch 5-star Google reviews and import as drafts. Edit if needed, then publish to the homepage carousel.
        </p>
        <Button
          onClick={handleFetchReviews}
          disabled={isLoadingReviews}
          size="sm"
          variant="outline"
        >
          {isLoadingReviews ? 'Fetching...' : 'Fetch Reviews'}
        </Button>
        {googleReviews.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Fetched {googleReviews.length} five-star review(s): {availableToImport.length} available to import, {alreadyImportedReviews.length} already imported.
            </div>
            {alreadyImportedReviews.length > 0 && (
              <Button
                onClick={() => setShowImportedReviews((v) => !v)}
                size="sm"
                variant="outline"
              >
                {showImportedReviews ? 'Hide Already Imported' : 'Show Already Imported'}
              </Button>
            )}
            <div className="max-h-64 overflow-y-auto space-y-2 divide-y divide-neutral-100 dark:divide-neutral-700">
              {availableToImport.map((r) => (
                <label
                  key={r.id}
                  className="flex items-start gap-3 py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded px-2 -mx-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedReviewIds.has(r.id)}
                    onChange={() => toggleReviewSelection(r.id)}
                    className="mt-1 rounded border-neutral-300 text-brand-red focus:ring-brand-red"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm dark:text-white">{r.name}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">"{r.quote}"</p>
                  </div>
                </label>
              ))}
              {availableToImport.length === 0 && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
                  All fetched reviews have been imported.
                </p>
              )}
              {showImportedReviews && alreadyImportedReviews.map((r) => (
                <div
                  key={`imported-${r.id}`}
                  className="flex items-start gap-3 py-2 rounded px-2 -mx-2 bg-neutral-50 dark:bg-neutral-700/30 opacity-80"
                >
                  <input
                    type="checkbox"
                    disabled
                    checked
                    className="mt-1 rounded border-neutral-300 text-brand-red focus:ring-brand-red"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm dark:text-white">
                      {r.name}
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                        Imported
                      </span>
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">"{r.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
            {availableToImport.length > 0 && (
              <Button
                onClick={handleImportSelected}
                disabled={selectedReviewIds.size === 0 || isImporting}
                size="sm"
              >
                {isImporting ? 'Importing...' : `Import Selected (${selectedReviewIds.size})`}
              </Button>
            )}
          </div>
        )}
      </div>

      {manualTestimonials.length === 0 ? (
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
                  <th className="p-4 font-bold text-sm dark:text-white">Status</th>
                  <th className="p-4 font-bold text-sm text-right dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {manualTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${testimonial.published === false ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}`}>
                    <td className="p-4 font-bold text-sm dark:text-white">{testimonial.name}</td>
                    <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                      {testimonial.source === 'google' && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 mr-1">Google</span>
                      )}
                      {testimonial.role}
                    </td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300 max-w-md">
                      <p className="line-clamp-2">{testimonial.quote}</p>
                    </td>
                    <td className="p-4">
                      {testimonial.published === false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Live
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(testimonial.id as number, testimonial.published !== false)}
                        className={`font-bold text-xs uppercase transition-colors ${testimonial.published === false ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200' : 'text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200'}`}
                      >
                        {testimonial.published === false ? 'Publish' : 'Unpublish'}
                      </button>
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
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Quote (max {MAX_TESTIMONIAL_QUOTE_LENGTH} characters)</label>
                <textarea
                  rows={4}
                  required
                  maxLength={MAX_TESTIMONIAL_QUOTE_LENGTH}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value.slice(0, MAX_TESTIMONIAL_QUOTE_LENGTH) })}
                  placeholder="This gym has changed my life..."
                />
                <p className="text-xs text-neutral-500 mt-1">{formData.quote.length}/{MAX_TESTIMONIAL_QUOTE_LENGTH}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-green-500" />
                </label>
                <span className="text-sm font-bold dark:text-neutral-300">
                  {formData.published ? 'Published — visible on homepage' : 'Draft — hidden from homepage'}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-neutral-700 mt-6">
              <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSave}>
                {editingTestimonial ? 'Save Changes' : 'Add Testimonial'}
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
