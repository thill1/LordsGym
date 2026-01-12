
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TESTIMONIALS, PROGRAMS, APP_NAME, ALL_PRODUCTS } from '../constants';
import { Testimonial, Program, SiteSettings, HomePageContent, CartItem, Product } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { runMigrations } from '../lib/migration';

// Initial Default State
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: APP_NAME,
  contactEmail: "info@lordsgymoutreach.com",
  contactPhone: "530-537-2105",
  address: "258 Elm Ave, Auburn, CA 95603",
  googleAnalyticsId: "",
  announcementBar: {
    enabled: false,
    message: "Join now and get your first month for $10!",
    link: "/membership"
  }
};

// Helper to get local media image path
const getMediaImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/${filename}`;
};

// Helper to get hero image path
const getHeroImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/hero/${filename}`;
};

const DEFAULT_HOME_CONTENT: HomePageContent = {
  hero: {
    headline: "TRAIN WITH PURPOSE.\nLIVE WITH FAITH.",
    subheadline: "Our mission is to bring strength and healing to our community through fitness, Christ and service.",
    ctaText: "Join Now",
    backgroundImage: getHeroImage('hero-background.jpg.jpg')
  },
  values: {
    stat1: "24/7", label1: "Access",
    stat2: "100%", label2: "Commitment",
    stat3: "1", label3: "Community"
  }
};

interface StoreContextType {
  // Data
  settings: SiteSettings;
  homeContent: HomePageContent;
  testimonials: Testimonial[];
  programs: Program[];
  products: Product[];
  
  // Cart Logic
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Actions
  updateSettings: (settings: SiteSettings) => void;
  updateHomeContent: (content: HomePageContent) => void;
  addTestimonial: (t: Testimonial) => void;
  deleteTestimonial: (id: number) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Auth
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [migrationRun, setMigrationRun] = useState(false);

  // Load from LocalStorage or use Defaults (fallback)
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('site_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [homeContent, setHomeContent] = useState<HomePageContent>(() => {
    // Version v2 used to force update the new hero text for existing users
    const saved = localStorage.getItem('home_content_v2');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_HOME_CONTENT;
    // Always ensure hero background uses the local image
    return {
      ...parsed,
      hero: {
        ...parsed.hero,
        backgroundImage: getHeroImage('hero-background.jpg.jpg')
      }
    };
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('site_testimonials');
    return saved ? JSON.parse(saved) : TESTIMONIALS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    // Always use the latest products from constants as source of truth
    // Only use localStorage if admin has made customizations (different product count or custom products)
    const saved = localStorage.getItem('shop_products');
    const savedProducts = saved ? JSON.parse(saved) : null;
    
    // If saved products exist and match the count/structure, merge to preserve admin edits
    // Otherwise, use fresh ALL_PRODUCTS to ensure new merchandise appears
    if (savedProducts && Array.isArray(savedProducts) && savedProducts.length === ALL_PRODUCTS.length) {
      const productMap = new Map(savedProducts.map((p: Product) => [p.id, p]));
      // Update all products from ALL_PRODUCTS to ensure images/titles are current
      ALL_PRODUCTS.forEach(newProduct => {
        const existing = productMap.get(newProduct.id);
        // Keep admin customizations (price, etc) but update image and title
        if (existing) {
          productMap.set(newProduct.id, { ...existing, image: newProduct.image, title: newProduct.title });
        } else {
          productMap.set(newProduct.id, newProduct);
        }
      });
      return Array.from(productMap.values());
    }
    
    // Use fresh products if structure changed or no saved data
    return ALL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [programs] = useState<Program[]>(PROGRAMS); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load data from Supabase on mount (if configured)
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      try {
        // Run migration once on first load
        if (!migrationRun) {
          await runMigrations();
          setMigrationRun(true);
        }

        // Load settings
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (settingsData) {
          setSettings({
            siteName: settingsData.site_name,
            contactEmail: settingsData.contact_email,
            contactPhone: settingsData.contact_phone,
            address: settingsData.address,
            googleAnalyticsId: settingsData.google_analytics_id || '',
            announcementBar: settingsData.announcement_bar as SiteSettings['announcementBar']
          });
        }

        // Load home content
        const { data: homeData } = await supabase
          .from('home_content')
          .select('*')
          .eq('id', 'default')
          .single();

        if (homeData) {
          const content = {
            hero: homeData.hero as HomePageContent['hero'],
            values: homeData.values as HomePageContent['values']
          };
          // Ensure hero background uses local image
          content.hero.backgroundImage = getHeroImage('hero-background.jpg.jpg');
          setHomeContent(content);
        }

        // Load testimonials
        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (testimonialsData) {
          setTestimonials(testimonialsData.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            quote: t.quote
          })));
        }

        // Load products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsData && productsData.length > 0) {
          setProducts(productsData.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            category: p.category,
            image: p.image
          })));
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback to localStorage on error
      } finally {
        setIsLoading(false);
      }
    };

    loadFromSupabase();
  }, [migrationRun]);

  // Sync products with latest from constants on mount to ensure new merchandise appears
  useEffect(() => {
    if (isLoading) return;
    
    setProducts(prevProducts => {
      const currentProductIds = new Set(prevProducts.map(p => p.id));
      const latestProductIds = new Set(ALL_PRODUCTS.map(p => p.id));
      
      // If product structure changed (new products added), update to latest
      if (currentProductIds.size !== latestProductIds.size || 
          !Array.from(latestProductIds).every(id => currentProductIds.has(id))) {
        const productMap = new Map(prevProducts.map((p: Product) => [p.id, p]));
        ALL_PRODUCTS.forEach(newProduct => {
          const existing = productMap.get(newProduct.id);
          // Update image and title from constants, preserve price if admin customized
          if (existing) {
            productMap.set(newProduct.id, { ...existing, image: newProduct.image, title: newProduct.title });
          } else {
            productMap.set(newProduct.id, newProduct);
          }
        });
        return Array.from(productMap.values());
      }
      return prevProducts;
    });
  }, [isLoading]); // Run after Supabase load completes

  // Persistence Effects - Save to both localStorage and Supabase
  useEffect(() => {
    localStorage.setItem('site_settings', JSON.stringify(settings));
    
    if (isSupabaseConfigured() && !isLoading) {
      supabase
        .from('settings')
        .upsert({
          id: 'default',
          site_name: settings.siteName,
          contact_email: settings.contactEmail,
          contact_phone: settings.contactPhone,
          address: settings.address,
          google_analytics_id: settings.googleAnalyticsId || null,
          announcement_bar: settings.announcementBar,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('Error saving settings to Supabase:', error);
        });
    }
  }, [settings, isLoading]);

  useEffect(() => {
    localStorage.setItem('home_content_v2', JSON.stringify(homeContent));
    
    if (isSupabaseConfigured() && !isLoading) {
      supabase
        .from('home_content')
        .upsert({
          id: 'default',
          hero: homeContent.hero,
          values: homeContent.values,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('Error saving home content to Supabase:', error);
        });
    }
  }, [homeContent, isLoading]);

  useEffect(() => {
    localStorage.setItem('site_testimonials', JSON.stringify(testimonials));
    
    if (isSupabaseConfigured() && !isLoading) {
      // Note: This will create duplicates if not careful. Consider using upsert with id.
      testimonials.forEach(testimonial => {
        supabase
          .from('testimonials')
          .upsert({
            id: testimonial.id,
            name: testimonial.name,
            role: testimonial.role,
            quote: testimonial.quote,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.error('Error saving testimonial to Supabase:', error);
          });
      });
    }
  }, [testimonials, isLoading]);

  useEffect(() => {
    localStorage.setItem('shop_products', JSON.stringify(products));
    
    if (isSupabaseConfigured() && !isLoading) {
      products.forEach(product => {
        supabase
          .from('products')
          .upsert({
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
            image: product.image,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.error('Error saving product to Supabase:', error);
          });
      });
    }
  }, [products, isLoading]);

  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  // Check Auth on Mount
  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  // Actions
  const updateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    
    if (isSupabaseConfigured()) {
      await supabase
        .from('settings')
        .upsert({
          id: 'default',
          site_name: newSettings.siteName,
          contact_email: newSettings.contactEmail,
          contact_phone: newSettings.contactPhone,
          address: newSettings.address,
          google_analytics_id: newSettings.googleAnalyticsId || null,
          announcement_bar: newSettings.announcementBar,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
  };

  const updateHomeContent = async (newContent: HomePageContent) => {
    setHomeContent(newContent);
    
    if (isSupabaseConfigured()) {
      await supabase
        .from('home_content')
        .upsert({
          id: 'default',
          hero: newContent.hero,
          values: newContent.values,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
  };

  const addTestimonial = async (t: Testimonial) => {
    setTestimonials(prev => [...prev, t]);
    
    if (isSupabaseConfigured()) {
      await supabase
        .from('testimonials')
        .insert({
          id: t.id,
          name: t.name,
          role: t.role,
          quote: t.quote
        });
    }
  };

  const deleteTestimonial = async (id: number) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    
    if (isSupabaseConfigured()) {
      await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
    }
  };
  
  const addProduct = async (p: Product) => {
    setProducts(prev => [...prev, p]);
    
    if (isSupabaseConfigured()) {
      await supabase
        .from('products')
        .insert({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          image: p.image
        });
    }
  };

  const updateProduct = async (p: Product) => {
    setProducts(prev => prev.map(item => item.id === p.id ? p : item));
    
    if (isSupabaseConfigured()) {
      await supabase
        .from('products')
        .upsert({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          image: p.image,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
    
    if (isSupabaseConfigured()) {
      await supabase
        .from('products')
        .delete()
        .eq('id', id);
    }
  };

  const login = (password: string) => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  // Cart Functions
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  
  const addToCart = (product: Product, size: string) => {
    setCart(prev => {
      const cartId = `${product.id}-${size}`;
      const existing = prev.find(item => item.cartId === cartId);
      
      if (existing) {
        return prev.map(item => 
          item.cartId === cartId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { ...product, selectedSize: size, quantity: 1, cartId }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartId === cartId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      settings,
      homeContent,
      testimonials,
      programs,
      products,
      cart,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      updateSettings,
      updateHomeContent,
      addTestimonial,
      deleteTestimonial,
      addProduct,
      updateProduct,
      deleteProduct,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
