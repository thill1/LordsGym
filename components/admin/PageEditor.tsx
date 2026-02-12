import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { logPageAction } from '../../lib/activity-logger';
import { useToast } from '../../context/ToastContext';
import { safeGet, safeSet } from '../../lib/localStorage';
import RichTextEditor from './RichTextEditor';
import Button from '../Button';

const PAGE_STORAGE_KEY = 'lords_gym_page_content';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: any;
  meta_title: string | null;
  meta_description: string | null;
  meta_image: string | null;
  published: boolean;
}

const pageSlugs = [
  { slug: 'home', title: 'Home' },
  { slug: 'about', title: 'About' },
  { slug: 'membership', title: 'Membership' },
  { slug: 'training', title: '1-on-1 Training' },
  { slug: 'programs', title: 'Programs' },
  { slug: 'outreach', title: 'Outreach' },
  { slug: 'contact', title: 'Contact' }
];

function defaultPage(slug: string, title: string): Page {
  return {
    id: slug,
    slug,
    title,
    content: { html: '' },
    meta_title: null,
    meta_description: null,
    meta_image: null,
    published: true
  };
}

function loadPagesFromLocalStorage(): Page[] {
  const saved = safeGet<Page[]>(PAGE_STORAGE_KEY, []);
  return pageSlugs.map(({ slug, title }) => {
    const p = saved.find((x) => x.slug === slug);
    return p ? { ...defaultPage(slug, title), ...p, slug, title } : defaultPage(slug, title);
  });
}

const PageEditor: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [pages, setPages] = useState<Page[]>(loadPagesFromLocalStorage);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentHtml, setContentHtml] = useState('');

  const loadPages = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setPages(loadPagesFromLocalStorage());
      return;
    }
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title');

      if (error) throw error;
      if (data && data.length > 0) {
        setPages(data);
        return;
      }
      // No rows: ensure defaults exist and persist to localStorage for demo consistency
      const local = loadPagesFromLocalStorage();
      for (const pageSlug of pageSlugs) {
        if (!data?.find((p) => p.slug === pageSlug.slug)) {
          await createDefaultPage(pageSlug.slug, pageSlug.title);
        }
      }
      const { data: after } = await supabase.from('pages').select('*').order('title');
      if (after?.length) setPages(after);
      else setPages(local);
    } catch (error) {
      console.error('Error loading pages:', error);
      setPages(loadPagesFromLocalStorage());
    }
  }, []);

  const createDefaultPage = async (slug: string, title: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('pages').insert({
        slug,
        title,
        content: { html: '' },
        published: true
      });
    } catch (error) {
      console.error('Error creating default page:', error);
    }
  };

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (selectedPage) {
      if (selectedPage.content && typeof selectedPage.content === 'object' && selectedPage.content.html) {
        setContentHtml(selectedPage.content.html);
      } else {
        setContentHtml('');
      }
    }
  }, [selectedPage]);

  const handleSave = async () => {
    if (!selectedPage) return;

    setIsSaving(true);
    try {
      const updatedPage: Page = {
        ...selectedPage,
        content: { html: contentHtml }
      };
      const newPages = pages.map((p) => (p.slug === selectedPage.slug ? updatedPage : p));
      setPages(newPages);
      safeSet(PAGE_STORAGE_KEY, newPages);

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('pages')
          .update({ ...updatedPage, updated_at: new Date().toISOString() })
          .eq('id', selectedPage.id);
        if (error) throw error;
        await logPageAction('update', selectedPage.id, selectedPage.title);
      }

      setIsEditing(false);
      await loadPages();
      showSuccess('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      showError('Failed to save page.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedPage) {
      // Reset content HTML
      if (selectedPage.content && typeof selectedPage.content === 'object' && selectedPage.content.html) {
        setContentHtml(selectedPage.content.html);
      } else {
        setContentHtml('');
      }
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Page Content Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
            <h3 className="font-bold mb-4 dark:text-white">Pages</h3>
            <div className="space-y-2">
              {pageSlugs.map(pageSlug => {
                const page = pages.find(p => p.slug === pageSlug.slug);
                return (
                  <button
                    key={pageSlug.slug}
                    onClick={() => {
                      if (page) {
                        setSelectedPage(page);
                        setIsEditing(false);
                      }
                    }}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      selectedPage?.slug === pageSlug.slug
                        ? 'bg-brand-red text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm">{pageSlug.title}</div>
                    {page && (
                      <div className="text-xs mt-1 opacity-75">
                        {page.published ? 'Published' : 'Draft'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page Editor */}
        <div className="lg:col-span-2">
          {selectedPage ? (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">{selectedPage.title}</h2>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} size="sm">
                      Edit
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Meta Title</label>
                    <input
                      type="text"
                      value={selectedPage.meta_title || ''}
                      onChange={(e) => setSelectedPage({ ...selectedPage, meta_title: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      placeholder="Page title for SEO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Meta Description</label>
                    <textarea
                      value={selectedPage.meta_description || ''}
                      onChange={(e) => setSelectedPage({ ...selectedPage, meta_description: e.target.value })}
                      rows={3}
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      placeholder="Page description for SEO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Meta Image URL</label>
                    <input
                      type="text"
                      value={selectedPage.meta_image || ''}
                      onChange={(e) => setSelectedPage({ ...selectedPage, meta_image: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      placeholder="/media/hero/hero-background.jpg.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Page Content</label>
                    <RichTextEditor
                      value={contentHtml}
                      onChange={setContentHtml}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPage.published}
                      onChange={(e) => setSelectedPage({ ...selectedPage, published: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm font-bold dark:text-neutral-300">Published</label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-1">Meta Title</h3>
                    <p className="dark:text-white">{selectedPage.meta_title || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-1">Meta Description</h3>
                    <p className="dark:text-white">{selectedPage.meta_description || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-1">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedPage.published
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                    }`}>
                      {selectedPage.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-2">Content Preview</h3>
                    <div 
                      className="prose dark:prose-invert max-w-none p-4 bg-neutral-50 dark:bg-neutral-900 rounded border"
                      dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-neutral-500">No content</p>' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
              <p className="text-neutral-500 dark:text-neutral-400">
                Select a page from the list to edit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
