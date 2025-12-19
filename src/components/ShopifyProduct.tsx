import React from 'react';
import { Product } from '../types';
import Button from './Button';

// Mock component to simulate Shopify Buy Button / Storefront integration
const ShopifyProduct: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="group relative">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-80 relative">
        <img 
          src={product.image} 
          alt={product.title} 
          className="h-full w-full object-cover object-center lg:h-full lg:w-full group-hover:opacity-75 transition-opacity"
        />
        <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-sm">
          NEW
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm font-bold text-brand-charcoal dark:text-white">
            <a href="#">
              <span aria-hidden="true" className="absolute inset-0"></span>
              {product.title}
            </a>
          </h3>
          <p className="mt-1 text-sm text-neutral-500">{product.category}</p>
        </div>
        <p className="text-sm font-bold text-black dark:text-white">${product.price.toFixed(2)}</p>
      </div>
      
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-20 left-4 right-4 z-20">
         <Button size="sm" fullWidth className="shadow-lg bg-white text-black hover:bg-neutral-200">Add to Cart</Button>
      </div>
    </div>
  );
};

export default ShopifyProduct;