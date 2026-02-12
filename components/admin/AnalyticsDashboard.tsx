import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const PATH_TITLES: Record<string, string> = {
  '/': 'Home',
  '/membership': 'Membership',
  '/shop': 'Shop',
  '/calendar': 'Calendar',
  '/about': 'About',
  '/contact': 'Contact',
  '/training': '1-on-1 Training',
  '/programs': 'Programs',
  '/outreach': 'Outreach',
  '/checkout': 'Checkout',
  '/order-confirmation': 'Order Confirmation'
};

function getPathTitle(path: string): string {
  return PATH_TITLES[path] || path || 'Other';
}

function categorizeReferrer(referrer: string | null): string {
  if (!referrer) return 'Direct';
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes('google') || host.includes('bing') || host.includes('yahoo') || host.includes('duckduckgo')) {
      return 'Search';
    }
    if (host.includes('facebook') || host.includes('twitter') || host.includes('instagram') || host.includes('linkedin') || host.includes('tiktok')) {
      return 'Social Media';
    }
    return 'Referral';
  } catch {
    return 'Direct';
  }
}

const AnalyticsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pageViews, setPageViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [topPages, setTopPages] = useState<{ path: string; title: string; views: number }[]>([]);
  const [trafficSources, setTrafficSources] = useState<{ source: string; count: number; percentage: number }[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const fromDate = thirtyDaysAgo.toISOString();

        const { data: views, error } = await supabase
          .from('page_views')
          .select('path, referrer, session_id, created_at')
          .gte('created_at', fromDate);

        if (error) throw error;

        if (!views || views.length === 0) {
          setPageViews(0);
          setUniqueVisitors(0);
          setTopPages([]);
          setTrafficSources([]);
          setIsLoading(false);
          return;
        }

        const uniqueSessions = new Set(views.map((v) => v.session_id));
        const pathCounts = views.reduce<Record<string, number>>((acc, v) => {
          acc[v.path] = (acc[v.path] || 0) + 1;
          return acc;
        }, {});
        const sourceCounts = views.reduce<Record<string, number>>((acc, v) => {
          const src = categorizeReferrer(v.referrer);
          acc[src] = (acc[src] || 0) + 1;
          return acc;
        }, {});

        setPageViews(views.length);
        setUniqueVisitors(uniqueSessions.size);

        const top = Object.entries(pathCounts)
          .map(([path, views]) => ({ path, title: getPathTitle(path), views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
        setTopPages(top);

        const total = views.length;
        const sources = Object.entries(sourceCounts).map(([source, count]) => ({
          source,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }));
        sources.sort((a, b) => b.percentage - a.percentage);
        setTrafficSources(sources);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setPageViews(0);
        setUniqueVisitors(0);
        setTopPages([]);
        setTrafficSources([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 fade-in">
        <h1 className="text-3xl font-bold dark:text-white">Analytics & Reporting</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-neutral-500 dark:text-neutral-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-4xl font-bold mt-2 dark:text-white">{pageViews.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">Real-time from site</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Unique Visitors</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{uniqueVisitors.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">By session</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Top Pages</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{topPages.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Pages with traffic</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Sources</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{trafficSources.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Traffic sources</p>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Top Pages</h3>
        {topPages.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">No page views yet. Traffic will appear as visitors browse the site.</p>
        ) : (
          <div className="space-y-4">
            {topPages.map((page, index) => (
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
        )}
      </div>

      {/* Traffic Sources */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Traffic Sources</h3>
        {trafficSources.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">No traffic data yet.</p>
        ) : (
          <div className="space-y-4">
            {trafficSources.map((source) => (
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
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
        <p><strong>Real traffic data.</strong> Page views are captured as visitors browse the site. Run the migration <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">005_page_views.sql</code> if the table does not exist.</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
