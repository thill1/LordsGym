
export interface NavItem {
  label: string;
  path: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
  description?: string;
  inventory?: Record<string, number>;
  variants?: Record<string, any>;
}

export interface CartItem extends Product {
  cartId: string; // unique id combining product id and size
  quantity: number;
  selectedSize: string;
}

export interface ClassSession {
  id: string;
  title: string;
  time: string;
  instructor: string;
  duration: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

// --- CMS & BACKEND TYPES ---

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  googleAnalyticsId: string;
  announcementBar: {
    enabled: boolean;
    message: string;
    link?: string;
  };
}

export interface HomePageContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundImage: string;
  };
  values: {
    stat1: string;
    label1: string;
    stat2: string;
    label2: string;
    stat3: string;
    label3: string;
  };
}

export interface AdminState {
  isAuthenticated: boolean;
  user?: {
    email: string;
    role: 'admin' | 'editor';
  };
}
