import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { OutreachPageImages } from '../../types';
import { useToast } from '../../context/ToastContext';
import { logActivity } from '../../lib/activity-logger';
import Button from '../Button';

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

  useEffect(() => {
    if (outreachContent) {
      setFormData(outreachContent);
    }
  }, [outreachContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOutreachContent(formData);
      await logActivity({
        action_type: 'update',
        entity_type: 'settings',
        entity_id: 'outreach_content',
        description: 'Updated outreach page images',
      });
      showSuccess('Outreach page images updated successfully');
    } catch (error) {
      showError('Failed to update outreach page images');
      console.error('Error updating outreach content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof OutreachPageImages, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Outreach Page Images</h1>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Image URLs</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Use Media Library to upload images, then paste each URL here. Leave blank to use the default image.
        </p>
        <div className="space-y-4">
          {IMAGE_SLOTS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-bold mb-1 dark:text-neutral-300">{label}</label>
              <input
                type="text"
                className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                value={formData[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default OutreachContentEditor;
