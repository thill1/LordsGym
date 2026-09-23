import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SiteSettings } from '../../types';
import { useToast } from '../../context/ToastContext';

const SettingsManager: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const { showSuccess, showError } = useToast();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(draft);
      showSuccess('Settings saved successfully.');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings. Your previous settings are still active.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-8 fade-in" onSubmit={handleSave}>
      <h1 className="text-3xl font-bold dark:text-white mb-6">Global Settings</h1>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Site Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Site Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={draft.siteName}
              onChange={(e) => setDraft({ ...draft, siteName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Google Analytics ID</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={draft.googleAnalyticsId || ''}
              onChange={(e) => setDraft({ ...draft, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-neutral-500 mt-1">Enter your Google Analytics tracking ID</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Announcement Bar (Top Banner)</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Controls the top banner displayed across all pages. The banner appears with a red background and white text.
        </p>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="announceToggle"
              checked={draft.announcementBar.enabled}
              onChange={(e) => setDraft({ ...draft, announcementBar: { ...draft.announcementBar, enabled: e.target.checked } })}
              className="mr-2"
            />
            <label htmlFor="announceToggle" className="text-sm font-bold dark:text-white">Enable Top Banner</label>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Message</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={draft.announcementBar.message}
              onChange={(e) => setDraft({ ...draft, announcementBar: { ...draft.announcementBar, message: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Link (Optional)</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={draft.announcementBar.link || ''}
              onChange={(e) => setDraft({ ...draft, announcementBar: { ...draft.announcementBar, link: e.target.value || undefined } })}
              placeholder="/membership"
            />
            <p className="text-xs text-neutral-500 mt-1">URL to navigate to when banner is clicked</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Contact Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Email</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={draft.contactEmail}
              onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Phone</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={draft.contactPhone}
              onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setDraft(settings)}
          disabled={isSaving}
          className="px-5 py-2.5 rounded border border-neutral-300 dark:border-neutral-600 font-bold dark:text-white disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded bg-brand-red text-white font-bold disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsManager;
