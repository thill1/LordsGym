import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import Button from '../components/Button';
import { Product } from '../types';

const Admin: React.FC = () => {
  const {
    isAuthenticated,
    login,
    logout,
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

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pages' | 'store' | 'settings' | 'seo'>('dashboard');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState("Men's Apparel");
  const [prodImage, setProdImage] = useState('');

  // ✅ GitHub Pages-safe local hero URL (NO new URL())
  // File path in repo: public/media/lords-gym/LordsGym1.png
  const LOCAL_HERO_URL = `${import.meta.env.BASE_URL}media/lords-gym/LordsGym1.png`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleBackToSite = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = '/';
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdTitle(product.title);
      setProdPrice(product.price.toString());
      setProdCategory(product.category);
      setProdImage(product.image);
    } else {
      setEditingProduct(null);
      setProdTitle('');
      setProdPrice('');
      setProdCategory("Men's Apparel");
      setProdImage('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'); // default placeholder
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

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(prodPrice);
    if (isNaN(price)) return;

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: prodTitle,
      price: price,
      category: prodCategory,
      image: prodImage
    };

    if (editingProduct) {
      updateProduct(newProduct);
    } else {
      addProduct(newProduct);
    }
    setIsProductModalOpen(false);
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
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                className="w-full p-3 border border-neutral-300 rounded focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
              />
            </div>
            {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
            <Button fullWidth type="submit">Access Dashboard</Button>

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

      {/* Mobile Admin Header */}
      <div className="md:hidden bg-brand-charcoal text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <h2 className="font-display font-bold tracking-widest">CMS ADMIN</h2>
        <div className="flex items-center gap-4 text-xs font-bold uppercase">
          <a
            href="#/"
            onClick={handleBackToSite}
            className="text-neutral-400 hover:text-white"
          >
            Website
          </a>
          <button onClick={logout} className="text-brand-red hover:text-red-400">Logout</button>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <div className="w-64 bg-brand-charcoal text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-display font-bold text-xl tracking-widest">CMS ADMIN</h2>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left p-3 rounded transition-colors ${activeTab === 'dashboard' ? 'bg-brand-red' : 'hover:bg-white/10'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`w-full text-left p-3 rounded transition-colors ${activeTab === 'pages' ? 'bg-brand-red' : 'hover:bg-white/10'}`}
          >
            Page Content
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`w-full text-left p-3 rounded transition-colors ${activeTab === 'store' ? 'bg-brand-red' : 'hover:bg-white/10'}`}
          >
            Store / Merch
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left p-3 rounded transition-colors ${activeTab === 'settings' ? 'bg-brand-red' : 'hover:bg-white/10'}`}
          >
            Global Settings
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`w-full text-left p-3 rounded transition-colors ${activeTab === 'seo' ? 'bg-brand-red' : 'hover:bg-white/10'}`}
          >
            SEO & Analytics
          </button>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <a
            href="#/"
            onClick={handleBackToSite}
            className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Website
          </a>
          <button onClick={logout} className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow md:ml-64 p-8">

        {activeTab === 'dashboard' && (
          <div className="space-y-8 fade-in">
            <h1 className="text-3xl font-bold dark:text-white mb-6">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-brand-red">
                <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Total Members</h3>
                <p className="text-4xl font-bold mt-2 dark:text-white">1,245</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-brand-red">
                <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Leads (This Week)</h3>
                <p className="text-4xl font-bold mt-2 dark:text-white">38</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-brand-red">
                <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Store Products</h3>
                <p className="text-4xl font-bold mt-2 dark:text-white">{products.length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm mt-8">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                    <div>
                      <p className="font-bold text-sm dark:text-white">New Membership Inquiry</p>
                      <p className="text-xs text-neutral-500">John Doe • 2 hours ago</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">New</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="space-y-8 fade-in">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold dark:text-white">Store Manager</h1>
              <Button onClick={() => openProductModal()} size="sm">Add New Product</Button>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                    <tr>
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
                        <td colSpan={5} className="p-8 text-center text-neutral-500">No products found.</td>
                      </tr>
                    ) : (
                      products.map(product => (
                        <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
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
                          </td>
                          <td className="p-4 text-sm font-mono dark:text-white">${product.price.toFixed(2)}</td>
                          <td className="p-4 text-right space-x-3">
                            <button onClick={() => openProductModal(product)} className="text-brand-charcoal dark:text-white font-bold text-xs uppercase hover:text-brand-red transition-colors">Edit</button>
                            <button onClick={() => deleteProduct(product.id)} className="text-red-500 font-bold text-xs uppercase hover:text-red-700 transition-colors">Delete</button>
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
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Google Analytics ID</label>
                  <input
                    type="text"
                    placeholder="UA-XXXXXXXXX"
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => updateSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  />
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm">
                  <p><strong>Note:</strong> Sitemap XML is automatically generated at <code>/sitemap.xml</code></p>
                </div>
              </div>
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

    </div>
  );
};

export default Admin;
