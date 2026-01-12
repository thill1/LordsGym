import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useAutoSave } from '../../lib/useAutoSave';
import VersionHistory from './VersionHistory';
import RichTextEditor from './RichTextEditor';
import { UndoRedoManager } from '../../lib/undo-redo';
import { setGlobalUndoRedoHandlers } from '../../lib/keyboard-shortcuts';

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

const PageEditor: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const undoRedoManagerRef = useRef<UndoRedoManager<Page> | null>(null);

  const pageSlugs = [
    { slug: 'home', title: 'Home' },
    { slug: 'about', title: 'About' },
    { slug: 'membership', title: 'Membership' },
    { slug: 'training', title: '1-on-1 Training' },
    { slug: 'programs', title: 'Programs' },
    { slug: 'outreach', title: 'Outreach' },
    { slug: 'contact', title: 'Contact' }
  ];

  useEffect(() => {
    loadPages();
  }, []);

  // Initialize undo/redo manager when page is selected
  useEffect(() => {
    if (selectedPage) {
      if (!undoRedoManagerRef.current) {
        undoRedoManagerRef.current = new UndoRedoManager<Page>(selectedPage);
      }
      
      // Register global undo/redo handlers for keyboard shortcuts
      if (isEditing) {
        setGlobalUndoRedoHandlers(handleUndo, handleRedo);
      }
    }
    
    return () => {
      setGlobalUndoRedoHandlers(() => {}, () => {});
    };
  }, [selectedPage, isEditing]);

  const loadPages = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title');

      if (error) throw error;
      if (data) {
        setPages(data);
        // Create default pages if they don't exist
        for (const pageSlug of pageSlugs) {
          if (!data.find(p => p.slug === pageSlug.slug)) {
            await createDefaultPage(pageSlug.slug, pageSlug.title);
          }
        }
        await loadPages(); // Reload after creating defaults
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const createDefaultPage = async (slug: string, title: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('pages')
        .insert({
          slug,
          title,
          content: {},
          published: true
        });
    } catch (error) {
      console.error('Error creating default page:', error);
    }
  };

  // Update undo/redo history when page content changes
  const handlePageChange = (updatedPage: Page) => {
    setSelectedPage(updatedPage);
    if (undoRedoManagerRef.current && isEditing) {
      undoRedoManagerRef.current.push(updatedPage);
    }
  };

  const handleUndo = () => {
    if (undoRedoManagerRef.current && undoRedoManagerRef.current.canUndo()) {
      const previousState = undoRedoManagerRef.current.undo();
      if (previousState) {
        setSelectedPage(previousState);
      }
    }
  };

  const handleRedo = () => {
    if (undoRedoManagerRef.current && undoRedoManagerRef.current.canRedo()) {
      const nextState = undoRedoManagerRef.current.redo();
      if (nextState) {
        setSelectedPage(nextState);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedPage || !isSupabaseConfigured()) return;

    try {
      // Save version history before updating
      const storedVersions = localStorage.getItem(`page_versions_${selectedPage.id}`);
      const versions = storedVersions ? JSON.parse(storedVersions) : [];
      versions.push({
        id: Date.now().toString(),
        page_id: selectedPage.id,
        content: selectedPage.content,
        created_at: new Date().toISOString(),
        created_by: null
      });
      // Keep only last 10 versions
      const recentVersions = versions.slice(-10);
      localStorage.setItem(`page_versions_${selectedPage.id}`, JSON.stringify(recentVersions));

      const { error } = await supabase
        .from('pages')
        .update({
          ...selectedPage,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage.id);

      if (error) throw error;
      
      // Clear undo/redo history after save
      if (undoRedoManagerRef.current) {
        undoRedoManagerRef.current.clear();
      }
      
      setIsEditing(false);
      await loadPages();
      showSuccess('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      showError('Failed to save page.');
    }
  };

  const handleRestoreVersion = (version: any) => {
    if (selectedPage) {
      setSelectedPage({
        ...selectedPage,
        content: version.content
      });
      setShowVersionHistory(false);
    }
  };

  // Auto-save when editing
  useAutoSave(
    selectedPage,
    async (page) => {
      if (page && isEditing && isSupabaseConfigured()) {
        setIsSaving(true);
        try {
          await supabase
            .from('pages')
            .update({
              ...page,
              updated_at: new Date().toISOString()
            })
            .eq('id', page.id);
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          setTimeout(() => setIsSaving(false), 500);
        }
      }
    },
    2000 // 2 second delay
  );

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
          {showVersionHistory && selectedPage ? (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Version History</h2>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Close
                </button>
              </div>
              <VersionHistory pageId={selectedPage.id} onRestore={handleRestoreVersion} />
            </div>
          ) : selectedPage ? (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{selectedPage.title}</h2>
                  {isEditing && isSaving && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                      <span className="animate-spin">⏳</span> Auto-saving...
                    </p>
                  )}
                  {isEditing && !isSaving && selectedPage && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">All changes saved</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedPage && (
                    <button
                      onClick={() => setShowVersionHistory(!showVersionHistory)}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-brand-charcoal dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                    >
                      History
                    </button>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-brand-charcoal dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                    >
                      {isPreviewMode ? 'Edit' : 'Preview'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setIsPreviewMode(false);
                    }}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-brand-charcoal dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>

              {isEditing && isPreviewMode ? (
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 bg-neutral-50 dark:bg-neutral-900">
                  <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-4">Preview Mode</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    {selectedPage.content && typeof selectedPage.content === 'object' ? (
                      <div className="space-y-4">
                        {Array.isArray(selectedPage.content.sections) ? (
                          selectedPage.content.sections.map((section: any, index: number) => (
                            <div key={index} className="p-4 bg-white dark:bg-neutral-800 rounded border">
                              <h4 className="font-bold text-lg dark:text-white mb-2">{section.title || `Section ${index + 1}`}</h4>
                              <p className="text-neutral-700 dark:text-neutral-300">{section.content || ''}</p>
                            </div>
                          ))
                        ) : (
                          <pre className="text-sm dark:text-white">{JSON.stringify(selectedPage.content, null, 2)}</pre>
                        )}
                      </div>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400">No content to preview</p>
                    )}
                  </div>
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Meta Title</label>
                    <input
                      type="text"
                      value={selectedPage.meta_title || ''}
                      onChange={(e) => handlePageChange({ ...selectedPage, meta_title: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Meta Description</label>
                    <textarea
                      value={selectedPage.meta_description || ''}
                      onChange={(e) => handlePageChange({ ...selectedPage, meta_description: e.target.value })}
                      rows={3}
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Content Sections</label>
                    {selectedPage.content && typeof selectedPage.content === 'object' && Array.isArray(selectedPage.content.sections) ? (
                      <div className="space-y-2">
                        {selectedPage.content.sections.map((section: any, index: number) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => setDraggedSection(index)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (draggedSection !== null && draggedSection !== index) {
                                const newSections = [...selectedPage.content.sections];
                                const [removed] = newSections.splice(draggedSection, 1);
                                newSections.splice(index, 0, removed);
                                setSelectedPage({
                                  ...selectedPage,
                                  content: { ...selectedPage.content, sections: newSections }
                                });
                                setDraggedSection(index);
                              }
                            }}
                            onDragEnd={() => setDraggedSection(null)}
                            className="p-3 border rounded bg-white dark:bg-neutral-900 dark:border-neutral-700 cursor-move hover:border-brand-red transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm dark:text-white">{section.title || `Section ${index + 1}`}</span>
                              <span className="text-xs text-neutral-500">⋮⋮</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={JSON.stringify(selectedPage.content, null, 2)}
                        onChange={(e) => {
                          try {
                            setSelectedPage({ ...selectedPage, content: JSON.parse(e.target.value) });
                          } catch (err) {
                            // Invalid JSON, ignore
                          }
                        }}
                        rows={10}
                        className="w-full p-2 border rounded font-mono text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      />
                    )}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPage.published}
                      onChange={(e) => handlePageChange({ ...selectedPage, published: e.target.checked })}
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
