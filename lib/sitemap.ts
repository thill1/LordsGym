// Sitemap generation utility
// This would be used to generate a sitemap.xml file

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (urls: SitemapUrl[]): string => {
  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${url.loc}</loc>`;
    if (url.lastmod) entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
    if (url.changefreq) entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
    if (url.priority) entry += `\n    <priority>${url.priority}</priority>`;
    entry += `\n  </url>`;
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

export const getDefaultSitemapUrls = (baseUrl: string): SitemapUrl[] => {
  const now = new Date().toISOString().split('T')[0];
  
  return [
    { loc: `${baseUrl}/`, lastmod: now, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseUrl}/membership`, lastmod: now, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/about`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${baseUrl}/training`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
    { loc: `${baseUrl}/programs`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
    { loc: `${baseUrl}/outreach`, lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { loc: `${baseUrl}/calendar`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${baseUrl}/shop`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
    { loc: `${baseUrl}/contact`, lastmod: now, changefreq: 'monthly', priority: 0.7 }
  ];
};
