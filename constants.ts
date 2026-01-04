
import { NavItem, Testimonial, Product, Program } from './types';

export const APP_NAME = "Lord's Gym";

// INTEGRATION KEYS
// In production, these should be set via environment variables (e.g., .env file or Vercel config)
export const SHOPIFY_STORE_URL = (import.meta as any).env?.VITE_SHOPIFY_STORE_URL || "https://lords-gym-auburn.myshopify.com";
export const MINDBODY_SITE_ID = (import.meta as any).env?.VITE_MINDBODY_SITE_ID || "123456"; 
export const SQUARE_DONATION_URL = "https://checkout.square.site/merchant/MLJQEKT1SC3YW/checkout/LM65OFKUNRAUMDU4YIMON77A?src=sheet";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Membership', path: '/membership' },
  { label: 'Outreach', path: '/outreach' },
  { label: '1-on-1 Training', path: '/training' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Shop', path: '/shop' },
  { label: 'Contact', path: '/contact' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Member since 2021",
    quote: "More than just a gym. It's a place where I found strength in my recovery and a community that genuinely cares. The coaches are world-class."
  },
  {
    id: 2,
    name: "Mike T.",
    role: "Local Business Owner",
    quote: "The atmosphere at Lord's Gym is different. Focused, respectful, and encouraging. Best weight room in Auburn, hands down."
  },
  {
    id: 3,
    name: "Pastor David",
    role: "Community Partner",
    quote: "The facility provides a safe environment for youth and adults alike to build discipline."
  }
];

export const ALL_PRODUCTS: Product[] = [
  // Men's Collection
  {
    id: 'm1',
    title: "Lord's Cross Lifter Tee",
    price: 32.00,
    category: "Men's Apparel",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm2',
    title: "Squatting Cross Hoodie",
    price: 55.00,
    category: "Men's Apparel",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm3',
    title: "Squatting Cross Tee",
    price: 32.00,
    category: "Men's Apparel",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm4',
    title: "Sin of the World Long Sleeve",
    price: 38.00,
    category: "Men's Apparel",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm5',
    title: "Sin of the World Hoodie",
    price: 55.00,
    category: "Men's Apparel",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm6',
    title: "Cross Lifter Long Sleeve",
    price: 38.00,
    category: "Men's Apparel",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  // Women's & Accessories
  {
    id: 'w1',
    title: 'Faith Over Fear Tee',
    price: 32.00,
    category: "Women's Apparel",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'a1',
    title: 'Scripture Wristbands (3-Pack)',
    price: 10.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  }
];

export const FEATURED_PRODUCTS = ALL_PRODUCTS.slice(0, 4);

export const PROGRAMS: Program[] = [
  {
    id: 'powerlifting',
    title: 'Powerlifting Foundations',
    description: 'Master the squat, bench, and deadlift with technical precision and progressive overload.',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bodybuilding',
    title: 'Hypertrophy & Aesthetics',
    description: 'Sculpt your physique with high-volume training focused on muscle growth and symmetry.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'functional',
    title: 'Functional Fitness',
    description: 'Training for the real world. Improve mobility, core stability, and cardiovascular health.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
  }
];
