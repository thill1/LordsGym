import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { logMediaAction } from '../../lib/activity-logger';
import { safeGet, safeSet } from '../../lib/localStorage';
import ConfirmDialog from '../ConfirmDialog';
import { replaceImageUrl } from '../../lib/image-url-replacer';
import Button from '../Button';

const MEDIA_STORAGE_KEY = 'lords_gym_media_library';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  file_type: string;
  file_size: number;
  folder: string | null;
  tags: string[] | null;
  alt_text: string | null;
  created_at: string;
}

function loadMediaFromLocalStorage(): MediaItem[] {
  return safeGet<MediaItem[]>(MEDIA_STORAGE_KEY, []);
}

const MediaLibrary: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [media, setMedia] = useState<MediaItem[]>(loadMediaFromLocalStorage);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | null }>({ isOpen: false, itemId: null });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [replaceUrlModal, setReplaceUrlModal] = useState<{ isOpen: boolean; oldUrl: string }>({ isOpen: false, oldUrl: '' });
  const [newUrl, setNewUrl] = useState('');

  const loadMedia = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setMedia(loadMediaFromLocalStorage());
      return;
    }
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setMedia(data);
    } catch (error) {
      console.error('Error loading media:', error);
      setMedia(loadMediaFromLocalStorage());
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured()) {
      setIsUploading(true);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        const newItem: MediaItem = {
          id: crypto.randomUUID?.() ?? `media-${Date.now()}`,
          filename: file.name,
          url: dataUrl,
          file_type: file.type,
          file_size: file.size,
          folder: null,
          tags: null,
          alt_text: null,
          created_at: new Date().toISOString()
        };
        setMedia((prev) => {
          const next = [newItem, ...prev];
          safeSet(MEDIA_STORAGE_KEY, next);
          return next;
        });
        showSuccess('File uploaded successfully!');
      } catch (err) {
        console.error('Error uploading file:', err);
        showError('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `media/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
      const { data: inserted, error: dbError } = await supabase.from('media').insert({
        filename: file.name,
        url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        folder: null,
        tags: null,
        alt_text: null
      }).select('id').single();
      if (dbError) throw dbError;
      if (inserted) await logMediaAction('create', inserted.id, file.name);
      await loadMedia();
      showSuccess('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    const item = media.find((m) => m.id === id);
    if (!isSupabaseConfigured()) {
      setMedia((prev) => {
        const next = prev.filter((m) => m.id !== id);
        safeSet(MEDIA_STORAGE_KEY, next);
        return next;
      });
      showSuccess('Media item deleted successfully!');
      setDeleteConfirm({ isOpen: false, itemId: null });
      return;
    }
    try {
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) throw error;
      if (item) await logMediaAction('delete', id, item.filename);
      await loadMedia();
      showSuccess('Media item deleted successfully!');
      setDeleteConfirm({ isOpen: false, itemId: null });
    } catch (error) {
      console.error('Error deleting media:', error);
      showError('Failed to delete media item.');
      setDeleteConfirm({ isOpen: false, itemId: null });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!isSupabaseConfigured()) {
      const ids = Array.from(selectedItems);
      setMedia((prev) => {
        const next = prev.filter((m) => !ids.includes(m.id));
        safeSet(MEDIA_STORAGE_KEY, next);
        return next;
      });
      setSelectedItems(new Set());
      showSuccess(`${ids.length} media item(s) deleted successfully!`);
      return;
    }
    try {
      const ids = Array.from(selectedItems);
      const { error } = await supabase.from('media').delete().in('id', ids);
      if (error) throw error;
      await loadMedia();
      setSelectedItems(new Set());
      showSuccess(`${ids.length} media item(s) deleted successfully!`);
    } catch (error) {
      console.error('Error bulk deleting media:', error);
      showError('Failed to delete media items.');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = () => {
    if (selectedItems.size === filteredMedia.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredMedia.map(item => item.id)));
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Media Library</h1>
        <label className="px-4 py-2 bg-brand-red text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors">
          {isUploading ? 'Uploading...' : 'Upload Media'}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
          />
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
          >
            <option value="all">All Folders</option>
          </select>
        </div>
        {selectedItems.size > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-sm font-bold dark:text-white">
              {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:text-white"
              >
                {selectedItems.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedItems.size} item(s)?`)) {
                    handleBulkDelete();
                  }
                }}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            No media found. Upload your first image to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden group relative border-2 ${
                selectedItems.has(item.id) ? 'border-brand-red' : 'border-transparent'
              }`}
            >
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-900 relative">
                {item.file_type.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="px-3 py-1 bg-white text-brand-charcoal rounded text-xs font-bold hover:bg-neutral-100"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => {
                      setReplaceUrlModal({ isOpen: true, oldUrl: item.url });
                      setNewUrl('');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, itemId: item.id })}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-bold truncate dark:text-white" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-xs text-neutral-500">
                  {(item.file_size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Media Item"
        message="Are you sure you want to delete this media item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm.itemId && handleDelete(deleteConfirm.itemId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null })}
        variant="danger"
      />

      {/* Replace URL Modal */}
      {replaceUrlModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Replace Image URL</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Replace all occurrences of this image URL across the site:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Old URL</label>
                <input
                  type="text"
                  value={replaceUrlModal.oldUrl}
                  readOnly
                  className="w-full p-2 border rounded bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">New URL</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReplaceUrlModal({ isOpen: false, oldUrl: '' });
                    setNewUrl('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  onClick={async () => {
                    if (!newUrl) {
                      showError('Please enter a new URL');
                      return;
                    }
                    try {
                      const result = await replaceImageUrl(replaceUrlModal.oldUrl, newUrl);
                      if (result.success) {
                        showSuccess(`Replaced ${result.affectedRows} occurrence(s) successfully!`);
                        setReplaceUrlModal({ isOpen: false, oldUrl: '' });
                        setNewUrl('');
                        await loadMedia();
                      } else {
                        showError(`Replaced ${result.affectedRows} occurrence(s) with ${result.errors.length} error(s)`);
                      }
                    } catch (error) {
                      showError('Failed to replace image URL');
                    }
                  }}
                  className="flex-1"
                >
                  Replace All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
