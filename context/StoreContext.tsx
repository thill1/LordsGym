
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TESTIMONIALS, PROGRAMS, APP_NAME, ALL_PRODUCTS } from '../constants';
import { Testimonial, Program, SiteSettings, HomePageContent, CartItem, Product, PopupModalConfig, OutreachPageImages } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { syncProductsFromConstants } from '../lib/store-products';
import { addToCart as addToCartOp, removeFromCart as removeFromCartOp, updateQuantity as updateQuantityOp, cartTotal as computeCartTotal, cartCount as computeCartCount } from '../lib/cart-operations';
import { safeGet, safeSet } from '../lib/localStorage';
import { MAX_TESTIMONIAL_QUOTE_LENGTH, normalizeTestimonialQuote } from '../lib/testimonials';

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

const truncateQuote = (s: string): string =>
  normalizeTestimonialQuote(s, MAX_TESTIMONIAL_QUOTE_LENGTH);

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

const OUTREACH_STORAGE_KEY = 'outreach_content_v1';

interface StoreContextType {
  // Data
  settings: SiteSettings;
  homeContent: HomePageContent;
  outreachContent: OutreachPageImages;
  testimonials: Testimonial[];
  programs: Program[];
  products: Product[];
  // True while the initial Supabase load is in flight; consumers can render
  // skeletons instead of stale-constants fallbacks.
  isLoading: boolean;
  // True if the most recent products fetch failed (timeout or error).
  // Lets the UI show an explicit empty/error state instead of fake placeholders.
  productsLoadFailed: boolean;

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
  updateOutreachContent: (content: OutreachPageImages) => void;
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
  const [productsLoadFailed, setProductsLoadFailed] = useState(false);
  const productsLoadedFromSupabaseRef = useRef(false);

  // Load from LocalStorage or use Defaults (fallback) — safe for quota/private mode
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (isSupabaseConfigured()) return DEFAULT_SETTINGS;
    const parsed = safeGet<Partial<SiteSettings>>('site_settings', DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      popupModals: Array.isArray(parsed?.popupModals) ? parsed.popupModals : []
    };
  });

  const [outreachContent, setOutreachContent] = useState<OutreachPageImages>(() => {
    return isSupabaseConfigured() ? {} : safeGet<OutreachPageImages>(OUTREACH_STORAGE_KEY, {});
  });

  const [homeContent, setHomeContent] = useState<HomePageContent>(() => {
    if (isSupabaseConfigured()) return DEFAULT_HOME_CONTENT;
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
    return isSupabaseConfigured() ? [] : safeGet<Testimonial[]>('site_testimonials', TESTIMONIALS);
  });

  const [products, setProducts] = useState<Product[]>(() => {
    // Supabase is always the source of truth when configured.
    // Never seed from ALL_PRODUCTS constants — that re-inserts products the admin deleted.
    // Start with [] and let the Supabase fetch on mount populate state.
    if (isSupabaseConfigured()) return [];

    // No Supabase (local dev without env vars): use localStorage or fall back to constants.
    const savedProducts = safeGet<Product[] | null>('shop_products_v2', null);
    if (!savedProducts || !Array.isArray(savedProducts) || savedProducts.length === 0) {
      return ALL_PRODUCTS;
    }
    return savedProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeGet<CartItem[]>('shop_cart', []);
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [programs] = useState<Program[]>(PROGRAMS); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load data from Supabase on mount (if configured)
  // Load products immediately in a separate effect so they appear ASAP,
  // not blocked by slower testimonials/Google reviews fetch
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const loadProducts = async () => {
      const PRODUCTS_FETCH_TIMEOUT_MS = 6000;
      const fetchProductsOnce = () =>
        Promise.race<{ data: any; error: any }>([
          supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false }),
          new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: null,
                  error: { message: `products fetch timed out after ${PRODUCTS_FETCH_TIMEOUT_MS}ms` }
                }),
              PRODUCTS_FETCH_TIMEOUT_MS
            )
          )
        ]);

      const productsResult = await fetchProductsOnce();

      const { data: productsData, error: productsError } = productsResult;

      if (productsError) {
        console.error('Error loading products from Supabase:', productsError);
        setProductsLoadFailed(true);
      } else if (productsData !== null && productsData !== undefined) {
        productsLoadedFromSupabaseRef.current = true;
        setProductsLoadFailed(false);
        const mapped = productsData.map((p: Record<string, unknown> & { id: string; title: string; price: number; category: string }) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          image: (p.image as string | null) ?? '',
          imageComingSoon: (p.image_coming_soon as boolean | null) ?? false,
          comingSoonImage: (p.coming_soon_image as string | null) ?? undefined,
          description: (p.description as string | null) ?? undefined,
          inventory: (p.inventory as Record<string, number> | null) ?? undefined,
          featured: (p.featured as boolean | null) ?? false
        }));
        setProducts(mapped);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      try {
        // Public visitors are read-only. Data migrations and writes belong in an
        // authenticated admin flow, never in the customer page bootstrap.
        // Fetch independent content in parallel. Selecting all outreach columns is
        // backward-compatible with the current photo_titles schema and a future
        // images column, avoiding a public 400 when deployments are out of sync.
        const [settingsResult, homeResult, outreachResult, testimonialsResult] = await Promise.all([
          supabase.from('settings').select('*').eq('id', 'default').single(),
          supabase.from('home_content').select('*').eq('id', 'default').single(),
          supabase.from('outreach_content').select('*').eq('id', 'default').single(),
          supabase
            .from('testimonials')
            .select('id, name, role, quote, source, external_id')
            .order('created_at', { ascending: false }),
        ]);

        const settingsData = settingsResult.data;

        if (settingsData) {
          setSettings({
            siteName: settingsData.site_name,
            contactEmail: settingsData.contact_email,
            contactPhone: settingsData.contact_phone,
            address: settingsData.address,
            googleAnalyticsId: settingsData.google_analytics_id || '',
            announcementBar: settingsData.announcement_bar as SiteSettings['announcementBar'],
            popupModals: (settingsData.popup_modals as PopupModalConfig[] | null) ?? []
          });
        }

        const homeData = homeResult.data;
        if (homeData) {
          const hero = homeData.hero as HomePageContent['hero'];
          setHomeContent({
            hero: {
              ...hero,
              headline: sanitizeHeadline(hero?.headline || ''),
              backgroundImage: getHeroImage('hero-background.jpg.jpg')
            },
            values: homeData.values as HomePageContent['values']
          });
        }

        const outreachData = outreachResult.data as Record<string, unknown> | null;
        if (outreachData?.images && typeof outreachData.images === 'object') {
          setOutreachContent(outreachData.images as OutreachPageImages);
        }

        const testimonialsData = testimonialsResult.data;
        if (!testimonialsResult.error && testimonialsData && testimonialsData.length > 0) {
          const mappedTestimonials: Testimonial[] = testimonialsData.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            quote: t.quote,
            source: t.source === 'google' ? ('google' as const) : ('manual' as const),
            externalId: t.external_id ?? undefined
          }));
          setTestimonials(mappedTestimonials);
          safeSet('site_testimonials', testimonialsData.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            quote: t.quote
          })));
        } else {
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromSupabase();
  }, []);

  // Sync products: add only new products from constants when NOT using Supabase.
  // When Supabase is configured, NEVER run sync — it would re-add deleted products (e.g. Faith Over Fear,
  // Scripture Wristbands) when the Supabase fetch fails (mobile, network, etc.). Supabase is source of truth.
  useEffect(() => {
    if (isLoading) return;
    if (isSupabaseConfigured()) return;
    if (productsLoadedFromSupabaseRef.current) return;
    setProducts((prevProducts) => syncProductsFromConstants(prevProducts, ALL_PRODUCTS));
  }, [isLoading]); // Run after load completes

  // Keep local fallbacks current. Supabase writes happen only inside explicit,
  // authenticated admin actions below—not automatically for every public visitor.
  useEffect(() => {
    safeSet('site_settings', settings);
  }, [settings]);

  useEffect(() => {
    safeSet('home_content_v2', homeContent);
  }, [homeContent]);

  useEffect(() => {
    safeSet(OUTREACH_STORAGE_KEY, outreachContent);
  }, [outreachContent]);

  useEffect(() => {
    // Only persist manual testimonials (numeric IDs) to localStorage as backup.
    // Supabase writes are handled individually in addTestimonial / updateTestimonial / deleteTestimonial.
    // Do NOT batch-upsert here: it would silently overwrite Supabase with truncated quotes on every load.
    const manualOnly = testimonials.filter((t): t is Testimonial & { id: number } => typeof t.id === 'number');
    safeSet('site_testimonials', manualOnly);
  }, [testimonials]);

  useEffect(() => {
    safeSet('shop_products_v2', products);
    // Supabase writes are handled exclusively by addProduct/updateProduct/deleteProduct
    // with activity logging. A bulk upsert here was silently overwriting the database
    // from stale localStorage on every admin session — the source of inventory corruption.
  }, [products]);

  useEffect(() => {
    safeSet('shop_cart', cart);
  }, [cart]);

  // Legacy auth state retained for backward compatibility with older components.
  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  // Actions
  const updateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    
    if (isSupabaseConfigured()) {
      const { error } = await supabase
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
      if (error) throw error;
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
      const { error } = await supabase
        .from('home_content')
        .upsert({
          id: 'default',
          hero: cleaned.hero,
          values: cleaned.values,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      if (error) throw error;
    }
  };

  const updateOutreachContent = async (newContent: OutreachPageImages) => {
    setOutreachContent(newContent);

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('outreach_content')
        .upsert({
          id: 'default',
          images: newContent,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      if (error) throw error;
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
    const quote = updates.quote !== undefined ? truncateQuote(updates.quote) : undefined;
    const cleanUpdates = quote !== undefined ? { ...updates, quote } : updates;

    if (isSupabaseConfigured()) {
      const existing = testimonials.find((t) => t.id === id);
      if (!existing) return;
      const merged = { ...existing, ...cleanUpdates };
      const quoteToSave = truncateQuote(merged.quote);
      const { data: updatedRow, error } = await supabase
        .from('testimonials')
        .update({
          name: merged.name,
          role: merged.role,
          quote: quoteToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, name, role, quote, source, external_id')
        .single();
      if (error) {
        console.error('Error updating testimonial in Supabase:', error);
        throw error;
      }

      if (updatedRow) {
        const mapped: Testimonial = {
          id: updatedRow.id,
          name: updatedRow.name,
          role: updatedRow.role,
          quote: updatedRow.quote,
          source: updatedRow.source === 'google' ? 'google' : 'manual',
          externalId: updatedRow.external_id ?? undefined
        };
        setTestimonials((prev) => prev.map((t) => (t.id === id ? mapped : t)));
      }
      return;
    }

    setTestimonials(prev => prev.map((t) => (t.id === id ? { ...t, ...cleanUpdates } : t)));
  };

  const deleteTestimonial = async (id: number) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting testimonial from Supabase:', error);
        throw error;
      }
    }
    setTestimonials(prev => prev.filter(t => t.id !== id));
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
    void password;
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
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
      outreachContent,
      testimonials,
      programs,
      products,
      isLoading,
      productsLoadFailed,
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
      updateOutreachContent,
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
    </StoreContext.Provider
>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
