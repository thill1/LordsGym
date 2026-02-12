import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { logActivity } from '../../lib/activity-logger';
import SchemaMarkupEditor from './SchemaMarkupEditor';
import { generateSitemap, getDefaultSitemapUrls } from '../../lib/sitemap';

const SEOManager: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const { showSuccess } = useToast();

  const handleDownloadSitemap = () => {
    const baseUrl = window.location.origin + (import.meta.env.BASE_URL || '').replace(/\/$/, '');
    const urls = getDefaultSitemapUrls(baseUrl);
    const sitemap = generateSitemap(urls);
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logActivity({ action_type: 'export', entity_type: 'settings', description: 'Exported sitemap.xml' });
    showSuccess('Sitemap generated and downloaded!');
  };

  return (
    <div className="space-y-8 fade-in">
      <h1 className="text-3xl font-bold dark:text-white mb-6">SEO & Analytics</h1>
      
      {/* Google Analytics */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Google Analytics</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Google Analytics ID</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              value={settings.googleAnalyticsId}
              onChange={(e) => updateSettings({ ...settings, googleAnalyticsId: e.target.value })}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Enter your Google Analytics 4 (G-XXXXXXXXXX) or Universal Analytics (UA-XXXXXXXXX) ID
            </p>
          </div>
        </div>
      </div>

      {/* Site-wide Meta Tags */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Site-wide Meta Tags</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Default Meta Title</label>
            <input
              type="text"
              placeholder="Lord's Gym - Train with Purpose, Live with Faith"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              maxLength={60}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Recommended: 50-60 characters</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Default Meta Description</label>
            <textarea
              rows={3}
              placeholder="Our mission is to bring strength and healing to our community through fitness, Christ and service."
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              maxLength={160}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Recommended: 150-160 characters</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Default Open Graph Image URL</label>
            <input
              type="text"
              placeholder="https://example.com/og-image.jpg"
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Recommended: 1200x630px image</p>
          </div>
        </div>
      </div>

      {/* Sitemap & Schema */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4 dark:text-white">Sitemap Generation</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm">
              <p><strong>Sitemap:</strong> Sitemap XML is automatically generated at <code className="bg-white dark:bg-neutral-800 px-2 py-1 rounded">/sitemap.xml</code></p>
            </div>
            <button 
              onClick={handleDownloadSitemap}
              className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Generate & Download Sitemap
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <SchemaMarkupEditor />
        </div>
      </div>

      {/* SEO Tips */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">SEO Best Practices</h3>
        <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Use descriptive, keyword-rich titles and descriptions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Keep meta descriptions between 150-160 characters</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Use high-quality Open Graph images (1200x630px)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Update page-specific meta tags in Page Content Management</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SEOManager;
