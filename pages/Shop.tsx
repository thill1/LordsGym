import React from 'react';
import Section from '../components/Section';
import ShopifyProduct from '../components/ShopifyProduct';
import { FEATURED_PRODUCTS } from '../constants';
import { Product } from '../types';

// Extended mock products for the full shop page
const ALL_PRODUCTS: Product[] = [
  ...FEATURED_PRODUCTS,
  {
    id: 'p5',
    title: 'Run The Race (Heb 12:1) Tee',
    price: 30.00,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p6',
    title: 'Carry Your Cross Tee',
    price: 32.00,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p7',
    title: 'Lifted High Performance Tee',
    price: 32.00,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p8',
    title: 'Scripture Wristbands (3-Pack)',
    price: 10.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
  }
];

const Shop: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="pt-32 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Lord's Gym Store</h1>
        <p className="text-xl text-neutral-400">Wear the mission. All proceeds support our outreach programs.</p>
      </Section>

      <Section>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h3 className="font-bold text-lg mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2">Collections</h3>
            <ul className="space-y-2">
              <li><button className="text-black dark:text-white font-bold">All Products</button></li>
              <li><button className="text-neutral-500 hover:text-black dark:hover:text-white">Men's Apparel</button></li>
              <li><button className="text-neutral-500 hover:text-black dark:hover:text-white">Women's Apparel</button></li>
              <li><button className="text-neutral-500 hover:text-black dark:hover:text-white">Accessories</button></li>
              <li><button className="text-neutral-500 hover:text-black dark:hover:text-white">Supplements</button></li>
            </ul>
          </div>

          {/* Product Grid */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {ALL_PRODUCTS.map(product => (
                <ShopifyProduct key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Shop;