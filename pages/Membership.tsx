
import React from 'react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

const MEMBERSHIP_PLANS: Record<string, Product> = {
  regular: {
    id: 'mem-regular',
    title: 'Regular Monthly Membership',
    price: 39.00,
    category: 'Membership',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  student: {
    id: 'mem-student',
    title: 'Student Monthly Membership',
    price: 29.00,
    category: 'Membership',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
  },
  annual: {
    id: 'mem-annual',
    title: '1 Year Paid In Full',
    price: 360.00,
    category: 'Membership',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a33801524?auto=format&fit=crop&w=800&q=80'
  }
};

const SETUP_FEE: Product = {
  id: 'fee-setup',
  title: 'Initiation / Setup Fee',
  price: 78.00,
  category: 'Fee',
  image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=800&q=80'
};

const Membership: React.FC = () => {
  const { addToCart, clearCart } = useStore();

  const handleJoin = (planId: string) => {
    clearCart(); // Clear cart for direct checkout flow to ensure only membership is being purchased
    addToCart(MEMBERSHIP_PLANS[planId], 'N/A');
    addToCart(SETUP_FEE, 'N/A');
    window.location.hash = '/checkout';
  };

  return (
    <>
      <Section bg="dark" className="text-center pt-32 pb-24">
        <div className="relative inline-block mb-4">
          <h1 className="text-5xl font-bold">MONTH-TO-MONTH</h1>
          <span className="absolute -right-6 -top-4 border border-white/20 text-neutral-400 bg-black/50 backdrop-blur-md px-2 py-1 rotate-12 font-bold uppercase tracking-widest text-xs">Memberships</span>
        </div>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto mt-4">
          Join the community built on faith and forged in iron.
        </p>
      </Section>

      <Section className="bg-neutral-100 dark:bg-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-32">
          
          {/* REGULAR MONTHLY */}
          <Card className="p-0 overflow-hidden flex flex-col shadow-2xl scale-100 md:scale-95 transition-transform hover:scale-100">
            <div className="bg-brand-charcoal text-white p-6 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full"></div>
              <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter relative z-10">REGULAR<br/>MONTHLY</h3>
            </div>
            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">Access to gym equipment</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-center rounded shadow-inner">
                <div className="text-4xl font-bold text-brand-red">$39</div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Monthly</div>
                <div className="text-[10px] text-neutral-400 mt-1 pt-1">+ $78 One-Time Setup Fee</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth onClick={() => handleJoin('regular')}>Join Now</Button>
            </div>
          </Card>

          {/* STUDENT (Featured/Middle) */}
          <Card className="p-0 overflow-hidden flex flex-col shadow-2xl relative z-10 transition-transform hover:scale-105">
            <div className="bg-black text-white p-6 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-neutral-900"></div>
              <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter relative z-10">STUDENT</h3>
              <span className="absolute top-2 right-2 bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest">Best Value</span>
            </div>
            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 leading-relaxed text-brand-charcoal dark:text-white">Current High School or<br/>College Student</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-center rounded shadow-inner">
                <div className="text-4xl font-bold text-brand-red">$29</div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Monthly</div>
                <div className="text-[10px] text-neutral-400 mt-1 pt-1">+ $78 One-Time Setup Fee</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth onClick={() => handleJoin('student')}>Join Now</Button>
            </div>
          </Card>

          {/* 1 YEAR PAID IN FULL */}
          <Card className="p-0 overflow-hidden flex flex-col shadow-2xl scale-100 md:scale-95 transition-transform hover:scale-100">
            <div className="bg-brand-charcoal text-white p-6 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full"></div>
              <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter relative z-10">1 YEAR PAID IN<br/>FULL</h3>
            </div>
            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 leading-relaxed text-brand-charcoal dark:text-white">Full Year Paid Up<br/>Front</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-center rounded shadow-inner">
                <div className="text-4xl font-bold text-brand-red">$360</div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">1 Year</div>
                <div className="text-[10px] text-neutral-400 mt-1 pt-1">+ $78 One-Time Setup Fee</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth onClick={() => handleJoin('annual')}>Join Now</Button>
            </div>
          </Card>
        </div>

        {/* PROMO FOOTER */}
        <div className="mt-20 text-center space-y-2">
          <p className="text-3xl md:text-5xl font-bold italic text-neutral-300 dark:text-neutral-700 uppercase tracking-tighter">No Long Term Contracts!</p>
          <p className="text-3xl md:text-5xl font-bold italic text-neutral-300 dark:text-neutral-700 uppercase tracking-tighter">No Annual Fees!</p>
        </div>
      </Section>

      <Section bg="alternate">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">Membership FAQ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">Why is there a setup fee?</h4>
                <p className="text-neutral-500">The $78 setup fee covers your initial onboarding, mobile app activation, and administrative setup to get you 24/7 access immediately.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">How do I verify my Student status?</h4>
                <p className="text-neutral-500">Bring a valid student ID from any local high school or college (like Sierra College) during staffed hours to activate your discounted rate.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">How does 24/7 access work?</h4>
                <p className="text-neutral-500">Members receive secure mobile app access that unlocks our front doors at any time, day or night, ensuring you can train on your schedule.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">What does "No Annual Fees" mean?</h4>
                <p className="text-neutral-500">Unlike big-box gyms, we don't surprise you with an "equipment fee" or "maintenance fee" six months into your membership. Your monthly price is your price.</p>
              </div>
            </div>
        </div>
      </Section>
    </>
  );
};

export default Membership;
