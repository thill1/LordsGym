import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { HomePageContent } from '../../types';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';

const HomeContentEditor: React.FC = () => {
  const { homeContent, updateHomeContent } = useStore();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<HomePageContent>({
    hero: {
      headline: '',
      subheadline: '',
      ctaText: '',
      backgroundImage: ''
    },
    values: {
      stat1: '',
      label1: '',
      stat2: '',
      label2: '',
      stat3: '',
      label3: ''
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (homeContent) {
      setFormData(homeContent);
    }
  }, [homeContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateHomeContent(formData);
      showSuccess('Home page content updated successfully');
    } catch (error) {
      showError('Failed to update home page content');
      console.error('Error updating home content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Home Page Content</h1>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Headline</label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={formData.hero.headline}
              onChange={(e) => setFormData({
                ...formData,
                hero: { ...formData.hero, headline: e.target.value }
              })}
              placeholder="TRAIN WITH PURPOSE.\nLIVE WITH FAITH."
            />
            <p className="text-xs text-neutral-500 mt-1">Use \n for line breaks</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Subheadline</label>
            <textarea
              rows={2}
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={formData.hero.subheadline}
              onChange={(e) => setFormData({
                ...formData,
                hero: { ...formData.hero, subheadline: e.target.value }
              })}
              placeholder="Our mission is to bring strength and healing to our community through fitness, Christ and service."
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">CTA Button Text</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={formData.hero.ctaText}
              onChange={(e) => setFormData({
                ...formData,
                hero: { ...formData.hero, ctaText: e.target.value }
              })}
              placeholder="Join Now"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Background Image URL</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={formData.hero.backgroundImage}
              onChange={(e) => setFormData({
                ...formData,
                hero: { ...formData.hero, backgroundImage: e.target.value }
              })}
              placeholder="/media/hero/hero-background.jpg.jpg"
            />
            <p className="text-xs text-neutral-500 mt-1">Use Media Library to upload images, then paste URL here</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Values Section (3 Stats)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Stat 1</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white mb-2"
              value={formData.values.stat1}
              onChange={(e) => setFormData({
                ...formData,
                values: { ...formData.values, stat1: e.target.value }
              })}
              placeholder="24/7"
            />
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={formData.values.label1}
              onChange={(e) => setFormData({
                ...formData,
                values: { ...formData.values, label1: e.target.value }
              })}
              placeholder="Access"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Stat 2</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white mb-2"
              value={formData.values.stat2}
              onChange={(e) => setFormData({
                ...formData,
                values: { ...formData.values, stat2: e.target.value }
              })}
              placeholder="100%"
            />
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={formData.values.label2}
              onChange={(e) => setFormData({
                ...formData,
                values: { ...formData.values, label2: e.target.value }
              })}
              placeholder="Commitment"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Stat 3</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white mb-2"
              value={formData.values.stat3}
              onChange={(e) => setFormData({
                ...formData,
                values: { ...formData.values, stat3: e.target.value }
              })}
              placeholder="1"
            />
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={formData.values.label3}
              onChange={(e) => setFormData({
                ...formData,
                values: { ...formData.values, label3: e.target.value }
              })}
              placeholder="Community"
            />
          </div>
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

export default HomeContentEditor;
