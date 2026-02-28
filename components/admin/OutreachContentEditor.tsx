import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { OutreachPageImages } from '../../types';
import { useToast } from '../../context/ToastContext';
import { logActivity } from '../../lib/activity-logger';
import { uploadMediaFile } from '../../lib/media-upload';
import { isSupabaseConfigured } from '../../lib/supabase';
import Button from '../Button';
import MediaPickerModal from './MediaPickerModal';

const IMAGE_SLOTS: { key: keyof OutreachPageImages; label: string; placeholder: string }[] = [
  { key: 'hero', label: 'Hero background', placeholder: '/media/hero/hero-background.jpg.jpg' },
  { key: 'trailer', label: 'Community Outreach (photo grid)', placeholder: '/media/outreach/outreach-trailer.jpg.jpeg' },
  { key: 'outreach', label: 'Cal Trans – Litter Pickup (photo grid)', placeholder: '/media/outreach/outreach-walking.jpg.JPG' },
  { key: 'prayer', label: '12 Step – Self Help (photo grid)', placeholder: '/media/outreach/outreach-prayer.jpg.jpeg' },
  { key: 'hug', label: 'Bible Study (photo grid)', placeholder: '/media/outreach/outreach-brotherhood.jpg.jpeg' },
  { key: 'community', label: 'Community photo (bottom section)', placeholder: '/media/outreach/outreach-community.jpg.jpeg' },
];

const OutreachContentEditor: React.FC = () => {
  const { outreachContent, updateOutreachContent } = useStore();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<OutreachPageImages>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<keyof OutreachPageImages | null>(null);
  const [pickerForSlot, setPickerForSlot] = useState<keyof OutreachPageImages | null>(null);
  const [showUrlInputs, setShowUrlInputs] = useState(false);

  useEffect(() => {
    if (outreachContent) {
      setFormData(outreachContent);
    }
  }, [outreachContent]);

  const saveToStore = async (next: OutreachPageImages) => {
    setFormData(next);
    setIsSaving(true);
    try {
      await updateOutreachContent(next);
      await logActivity({
        action_type: 'update',
        entity_type: 'settings',
        entity_id: 'outreach_content',
        description: 'Updated outreach page images',
      });
      showSuccess('Outreach images saved.');
    } catch (error) {
      showError('Failed to save. Please try again.');
      console.error('Error updating outreach content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSlotChange = (key: keyof OutreachPageImages, value: string | undefined) => {
    let next: OutreachPageImages;
    if (!value) {
      const { [key]: _, ...rest } = formData;
      next = rest as OutreachPageImages;
      setFormData(next);
    } else {
      next = { ...formData, [key]: value };
      setFormData(next);
    }
    saveToStore(next);
  };

  const handleUpload = async (key: keyof OutreachPageImages, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    if (!isSupabaseConfigured()) {
      showError('Upload requires Supabase. Use “Edit URL” to paste an image link.');
      return;
    }
    setUploadingSlot(key);
    try {
      const { url } = await uploadMediaFile(file);
      handleSlotChange(key, url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      showError(msg);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handlePickFromLibrary = (key: keyof OutreachPageImages) => {
    setPickerForSlot(key);
  };

  const handlePicked = (url: string) => {
    if (pickerForSlot) {
      handleSlotChange(pickerForSlot, url);
      setPickerForSlot(null);
    }
  };

  const handleUrlChange = (key: keyof OutreachPageImages, value: string) => {
    const next = { ...formData, [key]: value || undefined };
    setFormData(next);
  };

  const handleSave = () => {
    saveToStore(formData);
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-3xl font-bold dark:text-white">Outreach Page Images</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInputs((v) => !v)}
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-red"
          >
            {showUrlInputs ? 'Hide URL fields' : 'Edit URLs manually'}
          </button>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
        <p className="font-semibold mb-1">How to change outreach photos</p>
        <p className="mb-0">
          Use <strong>Upload new</strong> to add a photo (it’s saved to the Media Library and to this page automatically), or <strong>Choose from library</strong> to pick an existing image. No need to copy or paste URLs—changes save when you select an image.
        </p>
      </div>

      <div className="space-y-6">
        {IMAGE_SLOTS.map(({ key, label, placeholder }) => {
          const url = formData[key];
          const isUploading = uploadingSlot === key;
          return (
            <div
              key={key}
              className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700"
            >
              <label className="block text-sm font-bold mb-2 dark:text-neutral-300">{label}</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                  {url ? (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">No image</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-brand-red text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(key, e)}
                      disabled={isUploading}
                    />
                    {isUploading ? 'Uploading…' : 'Upload new'}
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePickFromLibrary(key)}
                  >
                    Choose from library
                  </Button>
                  {url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSlotChange(key, undefined)}
                      className="text-neutral-500"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              {showUrlInputs && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white text-sm"
                    value={formData[key] ?? ''}
                    onChange={(e) => handleUrlChange(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <MediaPickerModal
        isOpen={pickerForSlot !== null}
        onClose={() => setPickerForSlot(null)}
        onSelect={handlePicked}
        title="Choose image for this slot"
      />
    </div>
  );
};

export default OutreachContentEditor;
