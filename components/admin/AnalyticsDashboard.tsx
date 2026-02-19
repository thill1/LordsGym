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

const TRAFFIC_SOURCE_INFO: Record<string, { label: string; description: string }> = {
  Direct: {
    label: 'Direct',
    description: 'Visitors who typed your URL, used a bookmark, or arrived with no referrer (e.g., from email links, PDFs, or private/incognito browsing).'
  },
  Search: {
    label: 'Search',
    description: 'Traffic from search engines: Google, Bing, Yahoo, DuckDuckGo. Indicates organic discovery and SEO effectiveness.'
  },
  'Social Media': {
    label: 'Social Media',
    description: 'Visitors from social platforms: Facebook, Twitter/X, Instagram, LinkedIn, TikTok. Reflects engagement from your social posts and shares.'
  },
  Referral: {
    label: 'Referral',
    description: 'Traffic from other websites that link to you (partners, press, directories, forums). Excludes search and social platforms.'
  }
};

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

function parseDevice(userAgent: string | null): 'Mobile' | 'Tablet' | 'Desktop' | 'Unknown' {
  if (!userAgent || typeof userAgent !== 'string') return 'Unknown';
  const ua = userAgent.toLowerCase();
  // Tablets first (iPad, Android tablets)
  if (ua.includes('ipad') || (ua.includes('tablet') && !ua.includes('mobile')) || (ua.includes('android') && !ua.includes('mobile'))) return 'Tablet';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipod') || ua.includes('blackberry') || ua.includes('windows phone') || ua.includes('webos')) return 'Mobile';
  return 'Desktop';
}

function formatSessionDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const AnalyticsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pageViews, setPageViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [bounceRate, setBounceRate] = useState<number | null>(null);
  const [avgSessionSeconds, setAvgSessionSeconds] = useState<number | null>(null);
  const [topPages, setTopPages] = useState<{ path: string; title: string; views: number }[]>([]);
  const [trafficSources, setTrafficSources] = useState<{ source: string; count: number; percentage: number }[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<{ device: string; count: number; percentage: number }[]>([]);

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
          .select('path, referrer, session_id, created_at, user_agent')
          .gte('created_at', fromDate);

        if (error) throw error;

        if (!views || views.length === 0) {
          setPageViews(0);
          setUniqueVisitors(0);
          setBounceRate(null);
          setAvgSessionSeconds(null);
          setTopPages([]);
          setTrafficSources([]);
          setDeviceBreakdown([]);
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

        // Bounce rate: sessions with exactly 1 page view
        const viewsPerSession = views.reduce<Record<string, number>>((acc, v) => {
          acc[v.session_id] = (acc[v.session_id] || 0) + 1;
          return acc;
        }, {});
        const totalSessions = Object.keys(viewsPerSession).length;
        const bouncedSessions = Object.values(viewsPerSession).filter((c) => c === 1).length;
        const br = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;
        setBounceRate(br);

        // Avg session duration: avg of (max - min created_at) per session
        const bySession = views.reduce<Record<string, { min: number; max: number }>>((acc, v) => {
          const t = new Date(v.created_at).getTime();
          if (!acc[v.session_id]) acc[v.session_id] = { min: t, max: t };
          else {
            acc[v.session_id].min = Math.min(acc[v.session_id].min, t);
            acc[v.session_id].max = Math.max(acc[v.session_id].max, t);
          }
          return acc;
        }, {});
        const durations = Object.values(bySession).map(({ min, max }) => (max - min) / 1000);
        const avgSec = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
        setAvgSessionSeconds(avgSec);

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

        // Device breakdown from user_agent
        const deviceCounts = views.reduce<Record<string, number>>((acc, v) => {
          const device = parseDevice((v as { user_agent?: string }).user_agent ?? null);
          acc[device] = (acc[device] || 0) + 1;
          return acc;
        }, {});
        const deviceRows = Object.entries(deviceCounts).map(([device, count]) => ({
          device,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }));
        deviceRows.sort((a, b) => b.percentage - a.percentage);
        setDeviceBreakdown(deviceRows);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setPageViews(0);
        setUniqueVisitors(0);
        setBounceRate(null);
        setAvgSessionSeconds(null);
        setTopPages([]);
        setTrafficSources([]);
        setDeviceBreakdown([]);
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
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Bounce Rate</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">
            {bounceRate !== null ? `${bounceRate}%` : '—'}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Sessions with 1 page only
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Avg. Session</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">
            {avgSessionSeconds !== null ? formatSessionDuration(avgSessionSeconds) : '—'}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Time between first & last view
          </p>
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
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Where visitors come from, based on the HTTP referrer header. Helps prioritize marketing channels.
        </p>
        {trafficSources.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">No traffic data yet.</p>
        ) : (
          <div className="space-y-6">
            {trafficSources.map((source) => {
              const info = TRAFFIC_SOURCE_INFO[source.source] || { label: source.source, description: 'Traffic from this source.' };
              return (
                <div key={source.source} className="border-b border-neutral-200 dark:border-neutral-700 last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold dark:text-white">{info.label}</span>
                    <span className="text-sm font-bold dark:text-white">{source.count} views ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-brand-red h-2 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{info.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Device Breakdown */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Device Breakdown</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Device type inferred from the browser user agent. Use this to optimize for mobile vs desktop.
        </p>
        {deviceBreakdown.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">No device data yet.</p>
        ) : (
          <div className="space-y-4">
            {deviceBreakdown.map((row) => (
              <div key={row.device}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold dark:text-white">{row.device}</span>
                  <span className="text-sm font-bold dark:text-white">{row.count} views ({row.percentage}%)</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-brand-red h-2 rounded-full transition-all"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-300 text-sm space-y-2">
        <p><strong>Real traffic data.</strong> All metrics are stored in the <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">page_views</code> table and computed from database records. Run the migration <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">005_page_views.sql</code> if the table does not exist.</p>
        <p><strong>What we capture:</strong> Path, referrer, session ID, user agent (for device type), timestamp. <strong>Region/location is not captured</strong> — adding it would require storing visitor IP and using a GeoIP lookup service.</p>
        <p><strong>Phase 2 coming soon:</strong> Charts, member analytics, revenue tracking, attendance analytics, custom reports, export (CSV/PDF/Excel), optional region tracking via GeoIP.</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
