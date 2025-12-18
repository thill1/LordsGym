import { NavItem, Testimonial, Program, Product, ClassSession } from './types';

export const APP_NAME = "Lord's Gym";

// Placeholder keys for integrations
export const SHOPIFY_STORE_URL = "https://lords-gym-auburn.myshopify.com";
export const MINDBODY_SITE_ID = "123456";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Membership', path: '/membership' },
  { label: 'Programs', path: '/programs' },
  { label: 'Community', path: '/community' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
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
    quote: "Seeing the youth mentorship programs in action is inspiring. This gym is a pillar of light in our city."
  }
];

export const PROGRAMS: Program[] = [
  {
    id: 'strength',
    title: 'Strength & Conditioning',
    description: 'Functional fitness built for real life. Heavy compound movements, mobility, and metabolic conditioning.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'youth',
    title: 'Youth Mentorship',
    description: 'Building the next generation through discipline, sports, and guidance. Ages 12-18.',
    image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'recovery',
    title: 'Recovery Strong',
    description: 'A supportive fitness environment for those in addiction recovery. Heal the body, renew the mind.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80'
  }
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Redeemed Strength Tank',
    price: 28.00,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p2',
    title: 'Not Of This World Tee',
    price: 32.00,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p3',
    title: 'Iron Sharpens Iron Tee',
    price: 32.00,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p4',
    title: 'Faith Over Fear Tee',
    price: 32.00,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  }
];

export const UPCOMING_CLASSES: ClassSession[] = [
  { id: 'c1', title: 'Morning Glory Strength', time: '05:30 AM', instructor: 'Coach Mark', duration: '60 min' },
  { id: 'c2', title: 'Functional Fitness', time: '08:00 AM', instructor: 'Coach Sarah', duration: '60 min' },
  { id: 'c3', title: 'Lunch Crunch HIIT', time: '12:00 PM', instructor: 'Coach Dave', duration: '45 min' },
  { id: 'c4', title: 'Youth Outreach', time: '04:00 PM', instructor: 'Coach J', duration: '60 min' },
];