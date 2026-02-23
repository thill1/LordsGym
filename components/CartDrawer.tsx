
import React from 'react';
import { useStore } from '../context/StoreContext';
import Button from './Button';

interface CartDrawerProps {
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { isCartOpen, closeCart, cart, removeFromCart, updateQuantity, cartTotal } = useStore();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div data-testid="cart-drawer" className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-neutral-900 z-[101] shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-brand-charcoal text-white">
          <h2 className="text-xl font-display font-bold uppercase tracking-wider">Your Cart</h2>
          <button onClick={closeCart} className="text-neutral-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-neutral-500">
               <svg className="w-16 h-16 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
               </svg>
               <p>Your cart is empty.</p>
               <Button variant="outline" onClick={closeCart}>Start Shopping</Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="flex gap-4">
                <div className="w-20 h-24 bg-neutral-100 dark:bg-neutral-700 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.imageComingSoon || !item.image ? (
                    item.comingSoonImage ? (
                      <img src={item.comingSoonImage} alt="Coming soon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center leading-tight px-1">Coming soon</span>
                    )
                  ) : (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-brand-charcoal dark:text-white leading-tight pr-4">{item.title}</h4>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-neutral-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 uppercase font-bold mt-1">Size: {item.selectedSize}</p>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded">
                      <button 
                        onClick={() => updateQuantity(item.cartId, -1)}
                        className="px-2 py-1 text-neutral-500 hover:text-brand-charcoal dark:hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 text-sm font-bold">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.cartId, 1)}
                         className="px-2 py-1 text-neutral-500 hover:text-brand-charcoal dark:hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-brand-charcoal dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between mb-4">
              <span className="text-neutral-500 uppercase text-sm font-bold">Subtotal</span>
              <span className="text-xl font-bold dark:text-white">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-neutral-400 mb-6 text-center">Shipping & taxes calculated at checkout.</p>
            <Button fullWidth onClick={onCheckout}>Checkout Now</Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
