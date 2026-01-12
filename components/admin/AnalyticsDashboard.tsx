import React from 'react';
import { useStore } from '../../context/StoreContext';

const AnalyticsDashboard: React.FC = () => {
  const { products, testimonials } = useStore();

  // Mock analytics data - would come from Supabase in production
  const analytics = {
    pageViews: 12450,
    uniqueVisitors: 3420,
    bounceRate: 32.5,
    avgSessionDuration: '4m 32s',
    topPages: [
      { path: '/', views: 5420, title: 'Home' },
      { path: '/membership', views: 2340, title: 'Membership' },
      { path: '/shop', views: 1890, title: 'Shop' },
      { path: '/calendar', views: 1560, title: 'Calendar' },
      { path: '/about', views: 1240, title: 'About' }
    ],
    trafficSources: [
      { source: 'Direct', percentage: 45 },
      { source: 'Google Search', percentage: 30 },
      { source: 'Social Media', percentage: 15 },
      { source: 'Referral', percentage: 10 }
    ]
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Analytics & Reporting</h1>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Last 30 days
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Page Views</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{analytics.pageViews.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Unique Visitors</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{analytics.uniqueVisitors.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">+8% from last month</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Bounce Rate</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{analytics.bounceRate}%</p>
          <p className="text-xs text-neutral-400 mt-1">-2.5% from last month</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Avg. Session</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{analytics.avgSessionDuration}</p>
          <p className="text-xs text-neutral-400 mt-1">+15s from last month</p>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Top Pages</h3>
        <div className="space-y-4">
          {analytics.topPages.map((page, index) => (
            <div key={page.path} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-neutral-300 dark:text-neutral-600 w-8">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-sm dark:text-white">{page.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{page.path}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm dark:text-white">{page.views.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Traffic Sources</h3>
        <div className="space-y-4">
          {analytics.trafficSources.map(source => (
            <div key={source.source}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold dark:text-white">{source.source}</span>
                <span className="text-sm font-bold dark:text-white">{source.percentage}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-brand-red h-2 rounded-full transition-all"
                  style={{ width: `${source.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
        <p><strong>Note:</strong> Full analytics integration requires Google Analytics setup. Configure your Google Analytics ID in Global Settings.</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
