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
