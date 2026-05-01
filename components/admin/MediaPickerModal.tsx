import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { isSupabaseConfigured } from '../../lib/supabase';
import Button from '../Button';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  file_type: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Choose from Media Library'
}) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (!isSupabaseConfigured()) {
      setItems([]);
      setError('Media library requires Supabase.');
      return;
    }
    setLoading(true);
    supabase
      .from('media')
      .select('id, url, filename, file_type')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message || 'Failed to load media');
          setItems([]);
          return;
        }
        setItems((data as MediaItem[]) || []);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">{title}</h2>
          <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          {loading && (
            <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">Loading media…</p>
          )}
          {error && (
            <p className="text-red-600 dark:text-red-400 text-center py-4">{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
              No images in the library. Upload images in Media Library first.
            </p>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items
                .filter((item) => item.file_type?.startsWith('image/'))
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.url)}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-600 hover:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red bg-neutral-100 dark:bg-neutral-900"
                  >
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;
