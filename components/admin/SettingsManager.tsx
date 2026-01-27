import React from 'react';
import { useStore } from '../../context/StoreContext';
import { SiteSettings } from '../../types';

const SettingsManager: React.FC = () => {
  const { settings, updateSettings } = useStore();

  return (
    <div className="space-y-8 fade-in">
      <h1 className="text-3xl font-bold dark:text-white mb-6">Global Settings</h1>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Site Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Site Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={settings.siteName}
              onChange={(e) => updateSettings({ ...settings, siteName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Google Analytics ID</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={settings.googleAnalyticsId || ''}
              onChange={(e) => updateSettings({ ...settings, googleAnalyticsId: e.target.value })}
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
              checked={settings.announcementBar.enabled}
              onChange={(e) => updateSettings({ ...settings, announcementBar: { ...settings.announcementBar, enabled: e.target.checked } })}
              className="mr-2"
            />
            <label htmlFor="announceToggle" className="text-sm font-bold dark:text-white">Enable Top Banner</label>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Message</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={settings.announcementBar.message}
              onChange={(e) => updateSettings({ ...settings, announcementBar: { ...settings.announcementBar, message: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Link (Optional)</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={settings.announcementBar.link || ''}
              onChange={(e) => updateSettings({ ...settings, announcementBar: { ...settings.announcementBar, link: e.target.value || undefined } })}
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
              value={settings.contactEmail}
              onChange={(e) => updateSettings({ ...settings, contactEmail: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Phone</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={settings.contactPhone}
              onChange={(e) => updateSettings({ ...settings, contactPhone: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={settings.address}
              onChange={(e) => updateSettings({ ...settings, address: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
