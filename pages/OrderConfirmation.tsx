
import React, { useEffect } from 'react';
import Section from '../components/Section';
import Button from '../components/Button';

const OrderConfirmation: React.FC = () => {
  const orderNum = Math.floor(Math.random() * 1000000);

  useEffect(() => {
    window.scrollTo(0,0);
    // Confetti effect could go here
  }, []);

  return (
    <Section bg="alternate" className="pt-32 pb-20 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-neutral-800 p-8 md:p-12 rounded-lg shadow-xl text-center border-t-8 border-brand-red">
        
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
           </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-neutral-500 mb-8">Thank you for your support. Your gear is on the way.</p>

        <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg mb-8 text-left">
           <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-2">
              <span className="text-xs font-bold uppercase text-neutral-400">Order Number</span>
              <span className="font-mono font-bold">#{orderNum}</span>
           </div>
           <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-neutral-400">Est. Delivery</span>
              <span className="font-bold">3-5 Business Days</span>
           </div>
        </div>

        <p className="text-sm text-neutral-400 mb-8">
           A confirmation email has been sent to your email address.
        </p>

        <Button fullWidth onClick={() => window.location.hash = '/shop'}>
           Continue Shopping
        </Button>
      </div>
    </Section>
  );
};

export default OrderConfirmation;
