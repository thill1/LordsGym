
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TESTIMONIALS, PROGRAMS, APP_NAME, ALL_PRODUCTS } from '../constants';
import { Testimonial, Program, SiteSettings, HomePageContent, CartItem, Product } from '../types';

// Initial Default State
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: APP_NAME,
  contactEmail: "info@lordsgymauburn.com",
  contactPhone: "530-537-2105",
  address: "258 Elm Ave, Auburn, CA 95603",
  googleAnalyticsId: "",
  announcementBar: {
    enabled: false,
    message: "Join now and get your first month for $10!",
    link: "/membership"
  }
};

const DEFAULT_HOME_CONTENT: HomePageContent = {
  hero: {
    headline: "TRAIN WITH PURPOSE.\nLIVE WITH FAITH.",
    subheadline: "More than a gym. We are a community dedicated to building strength inside and out. 24/7 Access in Auburn, CA.",
    ctaText: "Join Now",
    backgroundImage: "https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=1920&q=80"
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
  // Load from LocalStorage or use Defaults
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('site_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [homeContent, setHomeContent] = useState<HomePageContent>(() => {
    const saved = localStorage.getItem('home_content');
    return saved ? JSON.parse(saved) : DEFAULT_HOME_CONTENT;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('site_testimonials');
    return saved ? JSON.parse(saved) : TESTIMONIALS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shop_products');
    return saved ? JSON.parse(saved) : ALL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [programs] = useState<Program[]>(PROGRAMS); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('site_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('home_content', JSON.stringify(homeContent)); }, [homeContent]);
  useEffect(() => { localStorage.setItem('site_testimonials', JSON.stringify(testimonials)); }, [testimonials]);
  useEffect(() => { localStorage.setItem('shop_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('shop_cart', JSON.stringify(cart)); }, [cart]);

  // Check Auth on Mount
  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  // Actions
  const updateSettings = (newSettings: SiteSettings) => setSettings(newSettings);
  const updateHomeContent = (newContent: HomePageContent) => setHomeContent(newContent);
  const addTestimonial = (t: Testimonial) => setTestimonials(prev => [...prev, t]);
  const deleteTestimonial = (id: number) => setTestimonials(prev => prev.filter(t => t.id !== id));
  
  const addProduct = (p: Product) => setProducts(prev => [...prev, p]);
  const updateProduct = (p: Product) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(item => item.id !== id));

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
