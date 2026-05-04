
import React from 'react';
import { Product } from '../types';
import Button from './Button';
import { MINDBODY_STORE_URL } from '../constants';

const ShopifyProduct: React.FC<{ product: Product }> = ({ product }) => {
  const buyUrl = product.mindbodyUrl || MINDBODY_STORE_URL;

  return (
    <div className="group relative bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-neutral-200 dark:bg-neutral-700 lg:aspect-none lg:h-80 relative flex items-center justify-center">
        {product.imageComingSoon || !product.image ? (
          product.comingSoonImage ? (
            <img
              src={product.comingSoonImage}
              alt="Coming soon"
              className="h-full w-full object-contain object-center"
            />
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 text-center font-bold px-4 text-sm sm:text-base">
              Coming soon: Lord&apos;s Gym merch
            </p>
          )
        ) : (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover object-center lg:h-full lg:w-full group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-2 right-2 bg-brand-red text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">
          NEW
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-bold text-brand-charcoal dark:text-white uppercase tracking-tight leading-tight">
              {product.title}
            </h3>
            <p className="mt-1 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{product.category}</p>
          </div>
          <p className="text-sm font-bold text-brand-red ml-2">${product.price.toFixed(2)}</p>
        </div>

        <div className="mt-auto pt-4">
          <Button
            size="sm"
            variant="brand"
            fullWidth
            className="shadow-md"
            onClick={() => window.open(buyUrl, '_blank', 'noopener,noreferrer')}
          >
            Buy on MindBody
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopifyProduct;
