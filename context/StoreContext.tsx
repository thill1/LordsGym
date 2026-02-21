
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TESTIMONIALS, PROGRAMS, APP_NAME, ALL_PRODUCTS } from '../constants';
import { Testimonial, Program, SiteSettings, HomePageContent, CartItem, Product, PopupModalConfig } from '../types';
import { supabase, isSupabaseConfigured, SUPABASE_URL, getAnonKey } from '../lib/supabase';
import { fetchGoogleReviews, DEFAULT_MAX_QUOTE_LENGTH, GoogleReviewTestimonial } from '../lib/google-reviews';
import { runMigrations } from '../lib/migration';
import { syncProductsFromConstants } from '../lib/store-products';
import { addToCart as addToCartOp, removeFromCart as removeFromCartOp, updateQuantity as updateQuantityOp, cartTotal as computeCartTotal, cartCount as computeCartCount } from '../lib/cart-operations';
import { safeGet, safeSet } from '../lib/localStorage';

// Initial Default State
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: APP_NAME,
  contactEmail: "lordsgymoutreach@gmail.com",
  contactPhone: "530-537-2105",
  address: "258 Elm Ave, Auburn, CA 95603",
  googleAnalyticsId: "",
  announcementBar: {
    enabled: false,
    message: "Join now and get your first month for $10!",
    link: "/membership"
  },
  popupModals: []
};

// Helper to get local media image path
const getMediaImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/${filename}`;
};

// Sanitize hero headline: remove \n (bug) so it displays on one line
const sanitizeHeadline = (s: string): string => (s || '').replace(/\\n|\n/g, ' ').trim();

const MAX_TESTIMONIAL_QUOTE_LENGTH = 200;
const truncateQuote = (s: string): string =>
  (s || '').slice(0, MAX_TESTIMONIAL_QUOTE_LENGTH).trim();

// Helper to get hero image path
const getHeroImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/hero/${filename}`;
};

const DEFAULT_HOME_CONTENT: HomePageContent = {
  hero: {
    headline: "Train with Purpose. Live with Faith.",
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
  updateTestimonial: (id: number, t: Partial<Testimonial>) => void;
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
  const productsLoadedFromSupabaseRef = useRef(false);

  // Load from LocalStorage or use Defaults (fallback) — safe for quota/private mode
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const parsed = safeGet<Partial<SiteSettings>>('site_settings', DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      popupModals: Array.isArray(parsed?.popupModals) ? parsed.popupModals : []
    };
  });

  const [homeContent, setHomeContent] = useState<HomePageContent>(() => {
    const parsed = safeGet<HomePageContent>('home_content_v2', DEFAULT_HOME_CONTENT);
    return {
      ...parsed,
      hero: {
        ...parsed.hero,
        headline: sanitizeHeadline(parsed?.hero?.headline || ''),
        backgroundImage: getHeroImage('hero-background.jpg.jpg')
      }
    };
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    return safeGet<Testimonial[]>('site_testimonials', TESTIMONIALS);
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = safeGet<Product[] | null>('shop_products', null);
    // When Supabase is source (incognito/fresh = no localStorage): never use ALL_PRODUCTS
    // as initial state. Use [] and let Supabase load. Otherwise mobile/failed-fetch shows
    // stale ALL_PRODUCTS including deleted items.
    if (isSupabaseConfigured() && (!savedProducts || !Array.isArray(savedProducts) || savedProducts.length === 0)) {
      return [];
    }
    if (!savedProducts || !Array.isArray(savedProducts)) return ALL_PRODUCTS;
    if (savedProducts.length === 0) return [];
    // When Supabase is source, respect deletions: never re-add from ALL_PRODUCTS when
    // we have fewer products (user deleted). Only merge when counts match (update images/titles).
    if (savedProducts.length === ALL_PRODUCTS.length) {
      const productMap = new Map(savedProducts.map((p: Product) => [p.id, p]));
      ALL_PRODUCTS.forEach(newProduct => {
        const existing = productMap.get(newProduct.id);
        if (existing) {
          productMap.set(newProduct.id, { ...existing, image: newProduct.image, title: newProduct.title });
        } else {
          productMap.set(newProduct.id, newProduct);
        }
      });
      return Array.from(productMap.values());
    }
    // Fewer products = user deleted. Use savedProducts; do NOT re-add from ALL_PRODUCTS.
    return savedProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeGet<CartItem[]>('shop_cart', []);
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
        // Check if localStorage has popup data - if so, preserve it (user's local changes take precedence)
        const savedLocalSettings = localStorage.getItem('site_settings');
        let hasLocalPopupData = false;
        
        if (savedLocalSettings) {
          try {
            const parsed = JSON.parse(savedLocalSettings) as Partial<SiteSettings>;
            hasLocalPopupData = Array.isArray(parsed?.popupModals) && parsed.popupModals.length > 0;
          } catch {
            hasLocalPopupData = false;
          }
        }
        
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (settingsData) {
          // Get current localStorage settings to preserve popupModals if they exist
          const localSettings = hasLocalPopupData 
            ? safeGet<Partial<SiteSettings>>('site_settings', DEFAULT_SETTINGS)
            : null;
          
          setSettings({
            siteName: settingsData.site_name,
            contactEmail: settingsData.contact_email,
            contactPhone: settingsData.contact_phone,
            address: settingsData.address,
            googleAnalyticsId: settingsData.google_analytics_id || '',
            announcementBar: settingsData.announcement_bar as SiteSettings['announcementBar'],
            // Preserve localStorage popupModals if they exist, otherwise use Supabase data
            popupModals: hasLocalPopupData && localSettings?.popupModals
              ? localSettings.popupModals
              : ((settingsData.popup_modals as PopupModalConfig[] | null) ?? [])
          });
        }

        // Load home content
        // Check if localStorage has saved data that differs from defaults - if so, keep it (user's local changes take precedence)
        const savedLocalContent = localStorage.getItem('home_content_v2');
        let hasLocalData = false;
        
        if (savedLocalContent) {
          try {
            const parsed = JSON.parse(savedLocalContent) as HomePageContent;
            // Check if headline has been changed from default (most common user edit)
            hasLocalData = parsed.hero?.headline !== DEFAULT_HOME_CONTENT.hero.headline;
          } catch {
            // If parsing fails, assume no local data
            hasLocalData = false;
          }
        }
        
        if (!hasLocalData) {
          // Only load from Supabase if localStorage is empty or has defaults
          const { data: homeData } = await supabase
            .from('home_content')
            .select('*')
            .eq('id', 'default')
            .single();

          if (homeData) {
            const hero = homeData.hero as HomePageContent['hero'];
            const content = {
              hero: {
                ...hero,
                headline: sanitizeHeadline(hero?.headline || ''),
                backgroundImage: getHeroImage('hero-background.jpg.jpg')
              },
              values: homeData.values as HomePageContent['values']
            };
            setHomeContent(content);
          }
        } else {
          // Keep localStorage data - user's changes are preserved
          const localContent = safeGet<HomePageContent>('home_content_v2', DEFAULT_HOME_CONTENT);
          setHomeContent({
            ...localContent,
            hero: {
              ...localContent.hero,
              headline: sanitizeHeadline(localContent?.hero?.headline || ''),
              backgroundImage: getHeroImage('hero-background.jpg.jpg')
            }
          });
        }

        // Load testimonials - Supabase is source of truth when configured (prevents data loss across devices)
        const { data: testimonialsData, error: testimonialsErr } = await supabase
          .from('testimonials')
          .select('id, name, role, quote, source, external_id')
          .order('created_at', { ascending: false });

        let manualTestimonials: Testimonial[] = [];
        if (!testimonialsErr && testimonialsData && testimonialsData.length > 0) {
          manualTestimonials = testimonialsData.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            quote: t.quote,
            source: t.source === 'google' ? ('google' as const) : ('manual' as const),
            externalId: t.external_id ?? undefined
          }));
          safeSet('site_testimonials', testimonialsData.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            quote: t.quote
          })));
        } else {
          const localTestimonials = safeGet<Testimonial[]>('site_testimonials', TESTIMONIALS);
          if (Array.isArray(localTestimonials) && localTestimonials.length > 0) {
            manualTestimonials = localTestimonials.map(t => ({ ...t, source: 'manual' as const }));
          }
        }

        // Fetch 5-star Google reviews (truncated) and merge with manual testimonials
        const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID as string | undefined;
        const googleReviews = placeId
          ? await fetchGoogleReviews(
              SUPABASE_URL,
              getAnonKey(),
              placeId,
              DEFAULT_MAX_QUOTE_LENGTH
            )
          : [];

        // Dedupe: exclude live Google reviews that are already imported (in DB)
        const importedExternalIds = new Set(
          (testimonialsData || [])
            .filter((t: { external_id?: string | null }) => t.external_id)
            .map((t: { external_id: string }) => t.external_id)
        );
        const liveGoogleReviews = googleReviews.filter((r) => !importedExternalIds.has(r.id));

        const googleAsTestimonials: Testimonial[] = liveGoogleReviews.map((t: GoogleReviewTestimonial) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          quote: t.quote,
          source: 'google' as const
        }));

        setTestimonials([...manualTestimonials, ...googleAsTestimonials]);

        // Load products — always use Supabase result (including empty) so admin and store stay in sync
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsData !== null && productsData !== undefined) {
          productsLoadedFromSupabaseRef.current = true;
          const mapped = productsData.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            category: p.category,
            image: p.image ?? '',
            imageComingSoon: p.image_coming_soon ?? false,
            comingSoonImage: (p as { coming_soon_image?: string | null }).coming_soon_image ?? undefined,
            description: (p as { description?: string | null }).description ?? undefined,
            inventory: (p as { inventory?: Record<string, number> | null }).inventory ?? undefined,
            featured: (p as { featured?: boolean | null }).featured ?? false
          }));
          setProducts(mapped);
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

  // Sync products: add only new products from constants when NOT using Supabase.
  // When Supabase is configured, NEVER run sync — it would re-add deleted products (e.g. Faith Over Fear,
  // Scripture Wristbands) when the Supabase fetch fails (mobile, network, etc.). Supabase is source of truth.
  useEffect(() => {
    if (isLoading) return;
    if (isSupabaseConfigured()) return;
    if (productsLoadedFromSupabaseRef.current) return;
    setProducts((prevProducts) => syncProductsFromConstants(prevProducts, ALL_PRODUCTS));
  }, [isLoading]); // Run after load completes

  // Persistence Effects - Save to both localStorage and Supabase
  useEffect(() => {
    safeSet('site_settings', settings);
    
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
          popup_modals: settings.popupModals ?? [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('Error saving settings to Supabase:', error);
        });
    }
  }, [settings, isLoading]);

  useEffect(() => {
    safeSet('home_content_v2', homeContent);
    
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
    const manualOnly = testimonials.filter((t): t is Testimonial & { id: number } => typeof t.id === 'number');
    safeSet('site_testimonials', manualOnly);

    if (isSupabaseConfigured() && !isLoading && manualOnly.length > 0) {
      (async () => {
        for (const t of manualOnly) {
          const { error } = await supabase
            .from('testimonials')
            .upsert(
              {
                id: t.id,
                name: t.name,
                role: t.role,
                quote: truncateQuote(t.quote),
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id', ignoreDuplicates: false }
            );
          if (error) {
            console.error('Error syncing testimonial to Supabase:', error);
          }
        }
      })();
    }
  }, [testimonials, isLoading]);

  useEffect(() => {
    safeSet('shop_products', products);
    // Only upsert to Supabase after we've loaded from Supabase. Otherwise we might push
    // wrong initial state (e.g. ALL_PRODUCTS) and re-add deleted products.
    if (isSupabaseConfigured() && !isLoading && productsLoadedFromSupabaseRef.current) {
      products.forEach(product => {
        supabase
          .from('products')
          .upsert({
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
            image: product.image || '',
            image_coming_soon: product.imageComingSoon ?? false,
            coming_soon_image: product.comingSoonImage || null,
            description: product.description || null,
            inventory: product.inventory ?? null,
            featured: product.featured ?? false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.error('Error saving product to Supabase:', error);
          });
      });
    }
  }, [products, isLoading]);

  useEffect(() => {
    safeSet('shop_cart', cart);
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
          popup_modals: newSettings.popupModals ?? [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
  };

  const updateHomeContent = async (newContent: HomePageContent) => {
    const cleaned = {
      ...newContent,
      hero: {
        ...newContent.hero,
        headline: sanitizeHeadline(newContent?.hero?.headline || '')
      }
    };
    setHomeContent(cleaned);

    if (isSupabaseConfigured()) {
      await supabase
        .from('home_content')
        .upsert({
          id: 'default',
          hero: cleaned.hero,
          values: cleaned.values,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
  };

  const addTestimonial = async (t: Testimonial) => {
    const quote = truncateQuote(t.quote);
    if (isSupabaseConfigured()) {
      const insertPayload: { name: string; role: string; quote: string; source?: string; external_id?: string } = {
        name: t.name,
        role: t.role,
        quote
      };
      if (t.source === 'google' && t.externalId) {
        insertPayload.source = 'google';
        insertPayload.external_id = t.externalId;
      }
      const { data: inserted, error } = await supabase
        .from('testimonials')
        .insert(insertPayload)
        .select('id, name, role, quote, source, external_id')
        .single();
      if (error) {
        console.error('Error saving testimonial to Supabase:', error);
        throw error;
      }
      if (inserted) {
        const mapped: Testimonial = {
          id: inserted.id,
          name: inserted.name,
          role: inserted.role,
          quote: inserted.quote,
          source: inserted.source === 'google' ? 'google' : 'manual',
          externalId: inserted.external_id ?? undefined
        };
        setTestimonials(prev => [...prev, mapped]);
        return;
      }
    }
    setTestimonials(prev => [...prev, { ...t, quote }]);
  };

  const updateTestimonial = async (id: number, updates: Partial<Testimonial>) => {
    let updatedTestimonial: Testimonial | undefined;
    const quote = updates.quote !== undefined ? truncateQuote(updates.quote) : undefined;
    const cleanUpdates = quote !== undefined ? { ...updates, quote } : updates;
    setTestimonials(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          updatedTestimonial = { ...t, ...cleanUpdates };
          return updatedTestimonial;
        }
        return t;
      });
      return updated;
    });
    
    if (isSupabaseConfigured() && updatedTestimonial) {
      const quoteToSave = truncateQuote(updatedTestimonial.quote);
      await supabase
        .from('testimonials')
        .update({
          name: updatedTestimonial.name,
          role: updatedTestimonial.role,
          quote: quoteToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
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
      const { error } = await supabase
        .from('products')
        .insert({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          image: p.image || '',
          image_coming_soon: p.imageComingSoon ?? false,
          coming_soon_image: p.comingSoonImage || null,
          description: p.description || null,
          inventory: p.inventory ?? null,
          featured: p.featured ?? false
        });
      if (error) throw error;
    }
  };

  const updateProduct = async (p: Product) => {
    setProducts(prev => prev.map(item => item.id === p.id ? p : item));
    
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          image: p.image || '',
          image_coming_soon: p.imageComingSoon ?? false,
          coming_soon_image: p.comingSoonImage || null,
          description: p.description || null,
          inventory: p.inventory ?? null,
          featured: p.featured ?? false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      if (error) throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
    setProducts((prev) => prev.filter((item) => item.id !== id));
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
    setCart((prev) => addToCartOp(prev, product, size));
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => removeFromCartOp(prev, cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) => updateQuantityOp(prev, cartId, delta));
  };

  const clearCart = () => setCart([]);

  const cartTotal = computeCartTotal(cart);
  const cartCount = computeCartCount(cart);

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
      updateTestimonial,
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
