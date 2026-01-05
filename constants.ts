
import { NavItem, Testimonial, Product, Program } from './types';

export const APP_NAME = "Lord's Gym";

// INTEGRATION KEYS
// In production, these should be set via environment variables (e.g., .env file or Vercel config)
export const SHOPIFY_STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL || "https://lords-gym-auburn.myshopify.com";
export const MINDBODY_SITE_ID = import.meta.env.VITE_MINDBODY_SITE_ID || "123456"; 
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

// Helper function to get merchandise image path
const getMerchImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/merchandise/${filename}`;
};

export const ALL_PRODUCTS: Product[] = [
  // Men's Collection - New Merchandise
  {
    id: 'm1',
    title: "Lord's Cross Lifter Tee",
    price: 32.00,
    category: "Men's Apparel",
    image: getMerchImage('lords-cross-lifter-tee.png.jpg')
  },
  {
    id: 'm2',
    title: "Lord's Cross Carrier Hoodie",
    price: 55.00,
    category: "Men's Apparel",
    image: getMerchImage('lords-cross-carrier-hoodie.png.jpg')
  },
  {
    id: 'm3',
    title: "Lord's Squatting Cross Hoodie",
    price: 55.00,
    category: "Men's Apparel",
    image: getMerchImage('lords-squatting-cross-hoodie.png.jpg')
  },
  {
    id: 'm4',
    title: "Son of Man Long Sleeve",
    price: 38.00,
    category: "Men's Apparel",
    image: getMerchImage('son-of-man-long-sleeve.png.jpg')
  },
  {
    id: 'm5',
    title: "Lord's Squatting Cross Tee",
    price: 32.00,
    category: "Men's Apparel",
    image: getMerchImage('lords-squatting-cross-tee.png.jpg')
  },
  {
    id: 'm6',
    title: "Lord's Cross Lifter Long Sleeve",
    price: 38.00,
    category: "Men's Apparel",
    image: getMerchImage('lords-cross-lifter-long-sleeve.png.jpg')
  },
  {
    id: 'm7',
    title: "Lord's Cross Barbell Hoodie",
    price: 55.00,
    category: "Men's Apparel",
    image: getMerchImage('lords-cross-barbell-hoodie.png.jpg')
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

// Featured products for home page (new arrivals)
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
