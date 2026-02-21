
import React, { useState } from 'react';
import { Product } from '../types';
import Button from './Button';
import { useStore } from '../context/StoreContext';

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

// Mock component to simulate Shopify Buy Button / Storefront integration
const ShopifyProduct: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useStore();
  const isApparel = product.category?.includes('Apparel') ?? false;
  const [selectedSize, setSelectedSize] = useState<string>(isApparel ? 'L' : 'One Size');
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, isApparel ? selectedSize : 'One Size');
  };

  return (
    <div 
      className="group relative bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-neutral-200 dark:bg-neutral-700 lg:aspect-none lg:h-80 relative flex items-center justify-center">
        {product.imageComingSoon || !product.image ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-center font-bold px-4 text-sm sm:text-base">
            Coming soon: Lord&apos;s Gym merch
          </p>
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

        {/* Size Selector & Add Button - Always visible on mobile, slide up on desktop */}
        <div className="mt-auto space-y-3 pt-4">
           {isApparel && (
             <div className="flex gap-2 justify-center">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-xs sm:text-[10px] w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded border transition-colors font-bold touch-manipulation ${
                      selectedSize === size 
                        ? 'bg-brand-charcoal text-white border-brand-charcoal dark:bg-white dark:text-brand-charcoal' 
                        : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-brand-red'
                    }`}
                  >
                    {size}
                  </button>
                ))}
             </div>
           )}
           <Button 
             size="sm" 
             variant="brand" 
             fullWidth 
             className="shadow-md"
             onClick={handleAddToCart}
           >
             Add to Cart
           </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopifyProduct;
