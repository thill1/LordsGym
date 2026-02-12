import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { updatePassword } from '../lib/auth';
import { setSupabaseAnonKey, resetSupabaseClient, getSupabaseAnonKeyFromStorage, isSupabaseConfigured } from '../lib/supabase';
import Button from '../components/Button';
import { Product } from '../types';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import PageEditor from '../components/admin/PageEditor';
import MediaLibrary from '../components/admin/MediaLibrary';
import UserManagement from '../components/admin/UserManagement';
import CalendarManager from '../components/admin/CalendarManager';
import RecurringEventsManager from '../components/admin/RecurringEventsManager';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import ProductBulkOperations from '../components/admin/ProductBulkOperations';
import ActivityLogs from '../components/admin/ActivityLogs';
import SettingsManager from '../components/admin/SettingsManager';
import PopupModalsManager from '../components/admin/PopupModalsManager';
import SEOManager from '../components/admin/SEOManager';
import HomeContentEditor from '../components/admin/HomeContentEditor';
import TestimonialsManager from '../components/admin/TestimonialsManager';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

const Admin: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct
  } = useStore();

  const { isAuthenticated, isLoading, login, logout, user, refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAnonKeyConfig, setShowAnonKeyConfig] = useState(false);
  const [anonKeyInput, setAnonKeyInput] = useState('');
  const [configSaved, setConfigSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'home' | 'pages' | 'testimonials' | 'store' | 'calendar' | 'media' | 'users' | 'popups' | 'settings' | 'seo' | 'analytics' | 'activity'>('dashboard');
  const [calendarSubTab, setCalendarSubTab] = useState<'events' | 'recurring'>('events');
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
      setConfigSaved(false);
      if (result.error?.includes('not configured') || result.error?.includes('Invalid Supabase') || result.error?.includes('GitHub Secrets')) {
        setShowAnonKeyConfig(true);
        setAnonKeyInput(getSupabaseAnonKeyFromStorage() || '');
      }
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
      const { logProductAction } = await import('../lib/activity-logger');
      if (editingProduct) {
        await updateProduct(newProduct);
        await logProductAction('update', newProduct.id, newProduct.title);
        showSuccess('Product updated successfully');
      } else {
        await addProduct(newProduct);
        await logProductAction('create', newProduct.id, newProduct.title);
        showSuccess('Product added successfully');
      }
      setIsProductModalOpen(false);
    } catch (error) {
      showError('Failed to save product');
    }
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

  // Force password change on first login
  if (isAuthenticated && user?.needsPasswordChange) {
    const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordChangeError('');
      if (newPassword.length < 8) {
        setPasswordChangeError('Password must be at least 8 characters');
        return;
      }
      if (newPassword !== newPasswordConfirm) {
        setPasswordChangeError('Passwords do not match');
        return;
      }
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordChangeError(error.message || 'Failed to update password');
        return;
      }
      await refreshUser();
      setNewPassword('');
      setNewPasswordConfirm('');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-charcoal">
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-brand-charcoal dark:text-white mb-2">Change Your Password</h2>
            <p className="text-neutral-500 dark:text-neutral-400">You must set a new password before accessing the admin dashboard.</p>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">New Password</label>
              <input
                type="password"
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none dark:bg-neutral-800 dark:text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password..."
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">Confirm New Password</label>
              <input
                type="password"
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none dark:bg-neutral-800 dark:text-white"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="Confirm new password..."
                required
                minLength={8}
              />
            </div>
            {passwordChangeError && <p className="text-red-600 text-sm font-bold">{passwordChangeError}</p>}
            <Button fullWidth type="submit">
              Set New Password
            </Button>
            <div className="text-center pt-4 border-t border-neutral-100 dark:border-neutral-700 mt-4">
              <button
                type="button"
                onClick={() => logout()}
                className="text-neutral-500 hover:text-brand-charcoal dark:hover:text-white text-sm font-bold"
              >
                Sign out
              </button>
            </div>
          </form>
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
            {import.meta.env.DEV && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
                <p className="text-blue-700 dark:text-blue-300 font-bold mb-1">Dev Mode:</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs">Use any email with password: <code className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">dev</code></p>
              </div>
            )}
            {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
            {showAnonKeyConfig && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded space-y-2">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-bold">Add Supabase anon key (one-time)</p>
                <p className="text-amber-700 dark:text-amber-300 text-xs">Get it from Supabase → Project → Settings → API → anon public</p>
                <input
                  type="password"
                  className="w-full p-2 border border-amber-300 dark:border-amber-700 rounded text-sm dark:bg-neutral-800 dark:text-white"
                  value={anonKeyInput}
                  onChange={(e) => setAnonKeyInput(e.target.value)}
                  placeholder="Paste anon key (eyJ...)"
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => { setSupabaseAnonKey(anonKeyInput); resetSupabaseClient(); setConfigSaved(true); setError(''); setShowAnonKeyConfig(false); }}>
                    Save & retry
                  </Button>
                  <button type="button" onClick={() => setShowAnonKeyConfig(false)} className="text-sm text-amber-600 dark:text-amber-400">Hide</button>
                </div>
                {configSaved && <p className="text-green-600 dark:text-green-400 text-xs">Key saved. Sign in above.</p>}
              </div>
            )}
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
        onLogout={async () => {
          const { logActivity } = await import('../lib/activity-logger');
          await logActivity({
            action_type: 'logout',
            entity_type: 'user',
            description: `User logged out: ${user?.email ?? 'Unknown'}`
          });
          await logout();
        }}
        onBackToSite={handleBackToSite}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <div className="flex-grow md:ml-64 p-8">
        {activeTab === 'dashboard' && <AdminDashboard onTabChange={setActiveTab} />}
        {activeTab === 'home' && <HomeContentEditor />}
        {activeTab === 'pages' && <PageEditor />}
        {activeTab === 'testimonials' && <TestimonialsManager />}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setCalendarSubTab('events')}
                className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${
                  calendarSubTab === 'events'
                    ? 'border-brand-red text-brand-red dark:text-brand-red'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setCalendarSubTab('recurring')}
                className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${
                  calendarSubTab === 'recurring'
                    ? 'border-brand-red text-brand-red dark:text-brand-red'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Recurring Events
              </button>
            </div>
            {calendarSubTab === 'events' && <CalendarManager />}
            {calendarSubTab === 'recurring' && <RecurringEventsManager />}
          </div>
        )}
        {activeTab === 'media' && <MediaLibrary />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'popups' && <PopupModalsManager />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'activity' && <ActivityLogs />}
        {activeTab === 'settings' && <SettingsManager />}
        {activeTab === 'seo' && <SEOManager />}

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
                const { logProductAction } = await import('../lib/activity-logger');
                for (const id of ids) {
                  const product = products.find(p => p.id === id);
                  await deleteProduct(id);
                  if (product) await logProductAction('delete', id, product.title);
                }
              }}
              onBulkUpdate={async (ids: string[], updates: Partial<Product>) => {
                const { logProductAction } = await import('../lib/activity-logger');
                for (const id of ids) {
                  const product = products.find(p => p.id === id);
                  if (product) {
                    await updateProduct({ ...product, ...updates } as Product);
                    await logProductAction('update', id, product.title);
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
                                      const { logProductAction } = await import('../lib/activity-logger');
                                      await deleteProduct(product.id);
                                      await logProductAction('delete', product.id, product.title);
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
