
import React, { useState, useEffect, useRef } from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface CheckoutProps {
  onSuccess: () => void;
  onNavigate: (path: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { cart, cartTotal, closeCart, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    closeCart();
  }, []);

  if (cart.length === 0) {
    return (
      <Section bg="alternate" className="pt-32 min-h-screen text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-8">Add some items before checking out.</p>
        <Button onClick={() => onNavigate('/shop')}>Return to Shop</Button>
      </Section>
    );
  }

  const handleProceed = async () => {
    const email = emailRef.current?.value.trim() || '';
    const name = nameRef.current?.value.trim() || '';

    if (!email) {
      setError('Please enter your email address.');
      emailRef.current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      emailRef.current?.focus();
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('Checkout is not available right now. Please contact us at lordsgymoutreach@gmail.com.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('store-checkout', {
        body: {
          items: cart,
          customerEmail: email,
          customerName: name || undefined,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Checkout failed');
      if (!data?.url) throw new Error('No checkout URL returned');

      clearCart();
      window.location.href = data.url as string;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <Section bg="alternate" className="pt-32 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left: Contact info */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-bold text-brand-charcoal dark:text-neutral-400">Shop</span>
            <span className="text-neutral-300">/</span>
            <span className="text-sm font-bold text-brand-red">Checkout</span>
          </div>

          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider">Your Information</h3>
            <p className="text-sm text-neutral-500">
              You'll enter your shipping address and payment details securely on the next page.
            </p>

            <div>
              <label htmlFor="checkout-email" className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                Email Address <span className="text-brand-red">*</span>
              </label>
              <input
                id="checkout-email"
                ref={emailRef}
                type="email"
                required
                autoComplete="email"
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="checkout-name" className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                Full Name
              </label>
              <input
                id="checkout-name"
                ref={nameRef}
                type="text"
                autoComplete="name"
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors"
                placeholder="Jane Smith"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            Payment is processed securely by Stripe. We never see your card details.
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border-t-4 border-brand-red sticky top-32">
            <h3 className="text-xl font-bold mb-6 border-b border-neutral-100 dark:border-neutral-700 pb-4">Order Summary</h3>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.imageComingSoon || !item.image ? (
                      item.comingSoonImage ? (
                        <img src={item.comingSoonImage} alt="Coming soon" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-neutral-500 dark:text-neutral-400 text-center leading-tight px-1">Coming soon</span>
                      )
                    ) : (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
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
                <span className="text-neutral-500 text-xs">Calculated by Stripe</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={handleProceed}
              disabled={loading}
            >
              {loading ? 'Redirecting to Payment...' : 'Proceed to Payment →'}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Checkout;
