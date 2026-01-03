
import React, { useState } from 'react';
import Section from '../components/Section';
import ShopifyProduct from '../components/ShopifyProduct';
import { useStore } from '../context/StoreContext';

const Shop: React.FC = () => {
  const { products } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All Products');

  const categories = ['All Products', "Men's Apparel", "Women's Apparel", 'Accessories'];

  const filteredProducts = activeCategory === 'All Products' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <>
      <Section bg="dark" className="pt-32 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 uppercase"><span className="text-brand-red">Lord's</span> Gym Store</h1>
        <p className="text-xl text-neutral-400">Wear the mission. All proceeds support our outreach programs.</p>
      </Section>

      <Section>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h3 className="font-bold text-lg mb-4 border-b-2 border-brand-red dark:border-brand-red pb-2 uppercase tracking-tighter">Collections</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category}>
                  <button 
                    onClick={() => setActiveCategory(category)}
                    className={`uppercase font-bold text-sm transition-colors ${
                      activeCategory === category 
                        ? 'text-brand-red' 
                        : 'text-neutral-500 hover:text-brand-red'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
