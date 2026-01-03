
import React, { useState, useEffect } from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';

interface CheckoutProps {
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess }) => {
  const { cart, cartTotal, closeCart, clearCart } = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    closeCart(); // Ensure cart drawer is closed when landing here
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      clearCart();
      onSuccess();
    }, 2000);
  };

  if (cart.length === 0) {
     return (
        <Section bg="alternate" className="pt-32 min-h-screen text-center flex flex-col items-center justify-center">
           <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
           <p className="mb-8">Add some items before checking out.</p>
           <Button onClick={() => window.location.hash = '/shop'}>Return to Shop</Button>
        </Section>
     );
  }

  return (
    <Section bg="alternate" className="pt-32 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Column: Forms */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-brand-charcoal dark:text-neutral-400">Shop</span>
              <span className="text-neutral-300">/</span>
              <span className="text-sm font-bold text-brand-red">Checkout</span>
           </div>

           <h1 className="text-4xl font-bold mb-8">Checkout</h1>

           <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
             
             {/* Contact Info */}
             <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Contact Information</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Email Address</label>
                      <input type="email" required className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" placeholder="you@example.com" />
                   </div>
                </div>
             </div>

             {/* Shipping Address */}
             <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Billing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">First Name</label>
                      <input type="text" required className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Last Name</label>
                      <input type="text" required className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Address</label>
                      <input type="text" required className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">City</label>
                      <input type="text" required className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Postal Code</label>
                      <input type="text" required className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                   </div>
                </div>
             </div>

             {/* Payment Mock */}
             <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold uppercase tracking-wider">Payment Details</h3>
                    <div className="flex space-x-2">
                       {/* Visa Icon */}
                       <svg className="h-6 w-auto" viewBox="0 0 36 24" fill="none">
                          <rect width="36" height="24" rx="2" fill="#1A1F71"/>
                          <path d="M12.937 15.65H14.809L15.981 8.448H14.109L12.937 15.65ZM26.069 8.647C25.807 8.552 25.378 8.481 24.845 8.481C23.497 8.481 22.545 9.183 22.531 10.208C22.52 10.957 23.21 11.374 23.733 11.623C24.269 11.879 24.45 12.04 24.448 12.268C24.445 12.607 24.04 12.759 23.674 12.759C23.018 12.759 22.625 12.586 22.327 12.449L21.986 14.004C22.42 14.201 23.23 14.368 24.085 14.385C25.532 14.385 26.484 13.673 26.502 12.576C26.512 11.921 26.115 11.436 25.138 10.975C24.238 10.536 23.978 10.301 23.984 10.024C23.989 9.771 24.262 9.502 24.908 9.502C25.398 9.492 25.955 9.61 26.262 9.75L26.595 8.35L26.069 8.647ZM29.28 15.65H30.982L29.932 8.448H28.406C28.026 8.448 27.708 8.665 27.568 8.991L24.841 15.65H26.713L27.086 14.622H29.35L29.566 15.65H29.28ZM27.609 13.23L28.167 10.641L28.789 13.23H27.609ZM18.847 8.448L17.659 14.267L17.067 11.332C16.829 10.45 16.634 9.531 16.326 9.043C16.035 8.577 15.688 8.384 15.222 8.318V8.448H18.239C18.667 8.448 18.785 8.786 18.847 8.448Z" fill="white"/>
                       </svg>
                       {/* Mastercard Icon */}
                       <svg className="h-6 w-auto" viewBox="0 0 36 24" fill="none">
                          <rect width="36" height="24" rx="2" fill="#222"/>
                          <circle cx="13" cy="12" r="7" fill="#EB001B"/>
                          <circle cx="23" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8"/>
                       </svg>
                    </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Card Number</label>
                      <div className="relative">
                         <input type="text" placeholder="4242 4242 4242 4242" className="w-full p-3 pl-10 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                         <svg className="w-5 h-5 absolute left-3 top-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                         </svg>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Expiration</label>
                         <input type="text" placeholder="MM / YY" className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">CVC</label>
                         <input type="text" placeholder="123" className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors" />
                      </div>
                   </div>
                   
                   <div className="flex items-center text-xs text-neutral-400 mt-2">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                      </svg>
                      Secure payment via Stripe
                   </div>
                </div>
             </div>

           </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border-t-4 border-brand-red sticky top-32">
              <h3 className="text-xl font-bold mb-6 border-b border-neutral-100 dark:border-neutral-700 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.cartId} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-0 right-0 bg-neutral-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full -mt-1 -mr-1">
                         {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow">
                       <p className="font-bold text-sm leading-tight">{item.title}</p>
                       <p className="text-xs text-neutral-500">
                          {item.category === 'Membership' ? 'Plan' : 'Size'}: {item.selectedSize}
                       </p>
                    </div>
                    <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-700 pt-4 mb-6">
                 <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Shipping</span>
                    <span className="font-bold">Free</span>
                 </div>
                 <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                 </div>
              </div>

              <Button 
                fullWidth 
                size="lg" 
                onClick={(e) => {
                    const form = document.getElementById('checkout-form') as HTMLFormElement;
                    if(form.checkValidity()) {
                        handleSubmit(e as any);
                    } else {
                        form.reportValidity();
                    }
                }}
                disabled={loading}
              >
                 {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
              </Button>
           </div>
        </div>
      </div>
    </Section>
  );
};

export default Checkout;
