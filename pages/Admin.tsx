import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Product } from '../types';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import PageEditor from '../components/admin/PageEditor';
import MediaLibrary from '../components/admin/MediaLibrary';
import UserManagement from '../components/admin/UserManagement';
import CalendarManager from '../components/admin/CalendarManager';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import ProductBulkOperations from '../components/admin/ProductBulkOperations';
import SchemaMarkupEditor from '../components/admin/SchemaMarkupEditor';
import ActivityLogs from '../components/admin/ActivityLogs';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { generateSitemap, getDefaultSitemapUrls } from '../lib/sitemap';
import { registerKeyboardShortcuts, ADMIN_SHORTCUTS } from '../lib/keyboard-shortcuts';

const Admin: React.FC = () => {
  const {
    settings,
    updateSettings,
    homeContent,
    updateHomeContent,
    testimonials,
    deleteTestimonial,
    products,
    addProduct,
    updateProduct,
    deleteProduct
  } = useStore();

  const { isAuthenticated, isLoading, login, logout, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pages' | 'store' | 'calendar' | 'media' | 'users' | 'settings' | 'seo' | 'analytics' | 'activity'>('dashboard');
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState("Men's Apparel");
  const [prodImage, setProdImage] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodInventory, setProdInventory] = useState<Record<string, number>>({});
  const [prodFeatured, setProdFeatured] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // ✅ GitHub Pages-safe local hero URL (NO new URL())
  // File path in repo: public/media/lords-gym/LordsGym1.png
  const LOCAL_HERO_URL = `${import.meta.env.BASE_URL}media/lords-gym/LordsGym1.png`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    } else {
      const { logActivity } = await import('../lib/activity-logger');
      await logActivity({
        action_type: 'login',
        entity_type: 'user',
        description: `User logged in: ${email}`
      });
    }
  };

  const handleBackToSite = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (e) e.preventDefault();
    window.location.hash = '/';
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdTitle(product.title);
      setProdPrice(product.price.toString());
      setProdCategory(product.category);
      setProdImage(product.image);
      setProdDescription(product.description || '');
      setProdInventory(product.inventory || {});
      setProdFeatured(product.featured || false);
    } else {
      setEditingProduct(null);
      setProdTitle('');
      setProdPrice('');
      setProdCategory("Men's Apparel");
      setProdImage('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80');
      setProdDescription('');
      setProdInventory({});
      setProdFeatured(false);
    }
    setIsProductModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(prodPrice);
    if (isNaN(price)) {
      showError('Please enter a valid price');
      return;
    }

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: prodTitle,
      price: price,
      category: prodCategory,
      image: prodImage,
      featured: prodFeatured,
      inventory: Object.keys(prodInventory).length > 0 ? prodInventory : undefined
    };

    try {
      if (editingProduct) {
        await updateProduct(newProduct);
        showSuccess('Product updated successfully');
      } else {
        await addProduct(newProduct);
        showSuccess('Product added successfully');
      }
      setIsProductModalOpen(false);
    } catch (error) {
      showError('Failed to save product');
    }
  };

  // ✅ Helper actions for Hero background image field (safe on GitHub Pages)
  const setHeroBackgroundToLocal = () => {
    updateHomeContent({
      ...homeContent,
      hero: {
        ...homeContent.hero,
        backgroundImage: LOCAL_HERO_URL
      }
    });
  };

  const clearHeroBackground = () => {
    updateHomeContent({
      ...homeContent,
      hero: {
        ...homeContent.hero,
        backgroundImage: ''
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-charcoal">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-charcoal">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-brand-charcoal mb-2">Admin Portal</h2>
            <p className="text-neutral-500">Authorized personnel only.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-neutral-300 rounded focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lordsgym.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                className="w-full p-3 border border-neutral-300 rounded focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
            <Button fullWidth type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Access Dashboard'}
            </Button>

            <div className="text-center pt-4 border-t border-neutral-100 mt-4">
              <a
                href="#/"
                onClick={handleBackToSite}
                className="text-neutral-500 hover:text-brand-charcoal text-sm font-bold flex items-center justify-center gap-2"
              >
                &larr; Back to Website
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col md:flex-row relative">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        onLogout={() => logout()}
        onBackToSite={handleBackToSite}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <div className="flex-grow md:ml-64 p-8">
        {/* Keyboard Shortcuts Modal */}
        {showShortcuts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(ADMIN_SHORTCUTS).map(([shortcut, description]) => (
                  <div key={shortcut} className="flex justify-between items-center py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-sm dark:text-white">{description as string}</span>
                    <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-900 rounded text-xs font-mono dark:text-white">
                      {shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'pages' && <PageEditor />}
        {activeTab === 'calendar' && <CalendarManager />}
        {activeTab === 'media' && <MediaLibrary />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'store' && (
          <div className="space-y-8 fade-in">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold dark:text-white">Store Manager</h1>
              <Button onClick={() => openProductModal()} size="sm">Add New Product</Button>
            </div>

            <ProductBulkOperations
              products={products}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
              onBulkDelete={async (ids: string[]) => {
                for (const id of ids) {
                  await deleteProduct(id);
                }
              }}
              onBulkUpdate={async (ids: string[], updates: Partial<Product>) => {
                for (const id of ids) {
                  const product = products.find(p => p.id === id);
                  if (product) {
                    await updateProduct({ ...product, ...updates } as Product);
                  }
                }
              }}
            />

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                    <tr>
                      <th className="p-4 font-bold text-sm dark:text-white w-12">
                        <input
                          type="checkbox"
                          checked={selectedProducts.size === products.length && products.length > 0}
                          onChange={() => {
                            if (selectedProducts.size === products.length) {
                              setSelectedProducts(new Set());
                            } else {
                              setSelectedProducts(new Set(products.map(p => p.id)));
                            }
                          }}
                          className="cursor-pointer"
                        />
                      </th>
                      <th className="p-4 font-bold text-sm dark:text-white">Image</th>
                      <th className="p-4 font-bold text-sm dark:text-white">Title</th>
                      <th className="p-4 font-bold text-sm dark:text-white">Category</th>
                      <th className="p-4 font-bold text-sm dark:text-white">Price</th>
                      <th className="p-4 font-bold text-sm text-right dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500">No products found.</td>
                      </tr>
                    ) : (
                      products.map(product => (
                        <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={() => {
                                const newSelection = new Set(selectedProducts);
                                if (newSelection.has(product.id)) {
                                  newSelection.delete(product.id);
                                } else {
                                  newSelection.add(product.id);
                                }
                                setSelectedProducts(newSelection);
                              }}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="w-12 h-12 rounded overflow-hidden bg-neutral-100">
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-sm dark:text-white">{product.title}</td>
                          <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                            <span className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded text-xs uppercase font-bold tracking-wider">
                              {product.category}
                            </span>
                            {product.featured && (
                              <span className="ml-2 px-2 py-1 rounded text-xs uppercase font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                                Featured
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm font-mono dark:text-white">${product.price.toFixed(2)}</td>
                          <td className="p-4 text-right space-x-3">
                            <button onClick={() => openProductModal(product)} className="text-brand-charcoal dark:text-white font-bold text-xs uppercase hover:text-brand-red transition-colors">Edit</button>
                            <button 
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Delete Product',
                                  message: `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
                                  onConfirm: async () => {
                                    try {
                                      await deleteProduct(product.id);
                                      showSuccess('Product deleted successfully');
                                      setConfirmDialog(null);
                                    } catch (error) {
                                      showError('Failed to delete product');
                                      setConfirmDialog(null);
                                    }
                                  }
                                });
                              }}
                              className="text-red-500 font-bold text-xs uppercase hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-8 fade-in">
            <h1 className="text-3xl font-bold dark:text-white mb-6">Page Content</h1>

            {/* Home Hero Editor */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-neutral-700">Home Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Headline</label>
                  <textarea
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    rows={2}
                    value={homeContent.hero.headline}
                    onChange={(e) => updateHomeContent({ ...homeContent, hero: { ...homeContent.hero, headline: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Sub-headline</label>
                  <textarea
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    rows={3}
                    value={homeContent.hero.subheadline}
                    onChange={(e) => updateHomeContent({ ...homeContent, hero: { ...homeContent.hero, subheadline: e.target.value } })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">CTA Text</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      value={homeContent.hero.ctaText}
                      onChange={(e) => updateHomeContent({ ...homeContent, hero: { ...homeContent.hero, ctaText: e.target.value } })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Background Image URL</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      value={homeContent.hero.backgroundImage}
                      onChange={(e) => updateHomeContent({ ...homeContent, hero: { ...homeContent.hero, backgroundImage: e.target.value } })}
                    />

                    {/* ✅ Safe helper buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={setHeroBackgroundToLocal}
                        className="px-3 py-1.5 rounded bg-brand-charcoal text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                      >
                        Use Local Hero (Recommended)
                      </button>
                      <button
                        type="button"
                        onClick={clearHeroBackground}
                        className="px-3 py-1.5 rounded bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-300 transition-colors dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
                      >
                        Clear (Use Default)
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Tip: For GitHub Pages, a safe local path is <code className="font-mono">{LOCAL_HERO_URL}</code>. Avoid using <code className="font-mono">new URL(...)</code> with <code className="font-mono">BASE_URL</code> anywhere — it can cause a white screen at runtime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Values Editor */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-neutral-700">Stats Strip</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-2">
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      value={homeContent.values[`stat${num}` as keyof typeof homeContent.values]}
                      onChange={(e) => updateHomeContent({ ...homeContent, values: { ...homeContent.values, [`stat${num}`]: e.target.value } })}
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                      value={homeContent.values[`label${num}` as keyof typeof homeContent.values]}
                      onChange={(e) => updateHomeContent({ ...homeContent, values: { ...homeContent.values, [`label${num}`]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Manager */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-neutral-700">Testimonials</h3>
              <div className="space-y-4">
                {testimonials.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded">
                    <div>
                      <p className="font-bold text-sm dark:text-white">{t.name}</p>
                      <p className="text-xs text-neutral-500 truncate max-w-xs">{t.quote}</p>
                    </div>
                    <button
                      onClick={() => deleteTestimonial(t.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-xs text-neutral-400 italic">Adding new testimonials is disabled in this demo.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 fade-in">
            <h1 className="text-3xl font-bold dark:text-white mb-6">Global Settings</h1>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Announcement Bar</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="announceToggle"
                    checked={settings.announcementBar.enabled}
                    onChange={(e) => updateSettings({ ...settings, announcementBar: { ...settings.announcementBar, enabled: e.target.checked } })}
                    className="mr-2"
                  />
                  <label htmlFor="announceToggle" className="text-sm font-bold dark:text-white">Enable Top Bar</label>
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
        )}

        {activeTab === 'seo' && (
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
                    onClick={() => {
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
                      showSuccess('Sitemap generated and downloaded!');
                    }}
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
        )}

      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Product Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  value={prodTitle}
                  onChange={e => setProdTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Description</label>
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  value={prodDescription}
                  onChange={e => setProdDescription(e.target.value)}
                  placeholder="Product description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Price</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Category</label>
                  <select
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                  >
                    <option value="Men's Apparel">Men's Apparel</option>
                    <option value="Women's Apparel">Women's Apparel</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
              
              {/* Product Variants */}
              {prodCategory.includes('Apparel') && (
                <div className="space-y-4">
                  {/* Size Variants */}
                  <div>
                    <label className="block text-sm font-bold mb-2 dark:text-neutral-300">Inventory by Size</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['S', 'M', 'L', 'XL', '2XL'].map(size => (
                        <div key={size}>
                          <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">{size}</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white text-sm"
                            value={prodInventory[size] || ''}
                            onChange={e => setProdInventory({
                              ...prodInventory,
                              [size]: parseInt(e.target.value) || 0
                            })}
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Variants */}
                  <div>
                    <label className="block text-sm font-bold mb-2 dark:text-neutral-300">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {['Black', 'White', 'Navy', 'Gray', 'Red', 'Green', 'Blue'].map(color => {
                        const variantKey = `color_${color.toLowerCase()}`;
                        const isSelected = prodInventory[variantKey] !== undefined;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                const newInventory = { ...prodInventory };
                                delete newInventory[variantKey];
                                setProdInventory(newInventory);
                              } else {
                                setProdInventory({
                                  ...prodInventory,
                                  [variantKey]: 0
                                });
                              }
                            }}
                            className={`px-3 py-2 rounded border text-sm font-bold transition-colors ${
                              isSelected
                                ? 'bg-brand-red text-white border-brand-red'
                                : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 dark:text-white hover:border-brand-red'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                    {Object.keys(prodInventory).some(key => key.startsWith('color_')) && (
                      <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded">
                        <p className="text-xs font-bold mb-2 dark:text-neutral-300">Color Inventory:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(prodInventory)
                            .filter(key => key.startsWith('color_'))
                            .map(key => {
                              const color = key.replace('color_', '').replace(/^\w/, c => c.toUpperCase());
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="text-xs text-neutral-600 dark:text-neutral-400 w-16">{color}:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    className="flex-1 p-1 border rounded dark:bg-neutral-800 dark:border-neutral-700 dark:text-white text-xs"
                                    value={prodInventory[key] || 0}
                                    onChange={e => setProdInventory({
                                      ...prodInventory,
                                      [key]: parseInt(e.target.value) || 0
                                    })}
                                  />
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Featured Product */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={prodFeatured}
                  onChange={e => setProdFeatured(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-bold dark:text-neutral-300">
                  Feature this product on homepage
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 dark:text-neutral-300">Product Image</label>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter Image URL..."
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white text-sm"
                    value={prodImage}
                    onChange={e => setProdImage(e.target.value)}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 font-bold text-xs uppercase">Or Upload File</span>
                    </div>
                  </div>

                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 dark:border-neutral-600 border-dashed rounded-lg cursor-pointer bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400"><span className="font-bold">Click to upload</span></p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">PNG, JPG, GIF</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>

                {prodImage && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold mb-1 text-neutral-500 uppercase">Preview</label>
                    <div className="h-48 w-full rounded overflow-hidden bg-neutral-100 border dark:border-neutral-700 flex items-center justify-center">
                      <img
                        src={prodImage}
                        alt="Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-neutral-700 mt-6">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Save Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          variant="danger"
        />
      )}
    </div>
  );
};

export default Admin;
