
import React, { useState } from 'react';
import Section from '../components/Section';
import ShopifyProduct from '../components/ShopifyProduct';
import { useStore } from '../context/StoreContext';

const HERO_IMAGE = `${import.meta.env.BASE_URL || '/'}media/outreach/outreach-community.jpg.jpeg`.replace(/\/\/+/g, '/');

const Shop: React.FC = () => {
  const { products } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All Products');

  const categories = ['All Products', "Men's Apparel", "Women's Apparel", 'Accessories'];

  const filteredProducts = activeCategory === 'All Products' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <>
      <Section bg="image" bgImage={HERO_IMAGE} bgImagePosition="center top" className="min-h-[55vh] flex items-center justify-center text-center pt-32 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 uppercase text-white drop-shadow-lg"><span className="text-brand-red">Lord's</span> Gym Store</h1>
          <p className="text-xl text-white/90 drop-shadow-md">Wear the mission. All proceeds support our outreach programs.</p>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h3 className="font-bold text-lg mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2 uppercase tracking-tighter">Collections</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category}>
                  <button 
                    onClick={() => setActiveCategory(category)}
                    className={`uppercase font-bold text-sm transition-colors ${
                      activeCategory === category 
                        ? 'text-brand-charcoal dark:text-white underline decoration-2 underline-offset-4 decoration-brand-red' 
                        : 'text-neutral-500 hover:text-brand-charcoal dark:hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Grid */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map(product => (
                <ShopifyProduct key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                No products found in this category.
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
};

export default Shop;
