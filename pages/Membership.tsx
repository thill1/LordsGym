
import React from 'react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

// Helper function to get facility image path
const getFacilityImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/facility/${filename}`;
};

// Facility photos for membership cards
const IMAGES = {
  // Regular Monthly - Red weight machines with dark gym interior
  cardioArea: getFacilityImage('gym-weight-machines.png.png'),
  // Student Monthly - Squat racks with mirrors, leg press machine
  freeWeights: getFacilityImage('gym-squat-racks.png.png'),
  // Annual - Multi-station weight machine with mural
  fullFacility: getFacilityImage('gym-multi-station.png.png')
};

const MEMBERSHIP_PLANS: Record<string, Product> = {
  regular: {
    id: 'mem-regular',
    title: 'Regular Monthly Membership',
    price: 39.00,
    category: 'Membership',
    image: IMAGES.cardioArea
  },
  student: {
    id: 'mem-student',
    title: 'Student Monthly Membership',
    price: 29.00,
    category: 'Membership',
    image: IMAGES.freeWeights
  },
  annual: {
    id: 'mem-annual',
    title: '1 Year Paid In Full',
    price: 360.00,
    category: 'Membership',
    image: IMAGES.fullFacility
  }
};

const SETUP_FEE: Product = {
  id: 'fee-setup',
  title: 'Initiation / Setup Fee',
  price: 39.00,
  category: 'Fee',
  image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=800&q=80'
};

const Membership: React.FC = () => {
  const { addToCart, clearCart } = useStore();

  const handleJoin = (planId: string) => {
    clearCart(); // Clear cart for direct checkout flow to ensure only membership is being purchased
    addToCart(MEMBERSHIP_PLANS[planId], 'N/A');
    if (planId !== 'annual') {
      addToCart(SETUP_FEE, 'N/A');
    }
    window.location.hash = '/checkout';
  };

  return (
    <>
      <Section bg="dark" className="text-center pt-32 pb-24">
        <div className="relative inline-block mb-4">
          <h1 className="text-5xl font-bold">MONTH-TO-MONTH</h1>
          <span className="absolute -right-6 -top-4 border border-white/20 text-white bg-brand-red px-2 py-1 rotate-12 font-bold uppercase tracking-widest text-xs shadow-lg">Memberships</span>
        </div>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto mt-4">
          Join the community built on faith and forged in iron.
        </p>
      </Section>

      <Section className="bg-neutral-100 dark:bg-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-32">
          
          {/* REGULAR MONTHLY */}
          <Card className="p-0 overflow-visible flex flex-col shadow-2xl scale-100 md:scale-95 transition-transform hover:scale-100 relative">
            <div className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rotate-12 z-10 shadow-lg">Most Popular</div>
            {/* Header Image */}
            <div className="h-40 relative overflow-hidden">
               <img src={MEMBERSHIP_PLANS.regular.image} alt="Gym Facility" className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
               <div className="absolute bottom-4 left-4 text-white">
                 <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter">REGULAR<br/>MONTHLY</h3>
               </div>
            </div>
            
            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">Access to gym equipment</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-center rounded shadow-inner">
                <div className="text-4xl font-bold text-brand-red">$39</div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Monthly</div>
                <div className="text-[10px] text-neutral-400 mt-1 pt-1">+ $39 One-Time Setup Fee</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth onClick={() => handleJoin('regular')}>Join Now</Button>
            </div>
          </Card>

          {/* STUDENT (Featured/Middle) */}
          <Card className="p-0 overflow-hidden flex flex-col shadow-2xl relative z-10 transition-transform hover:scale-105">
            {/* Header Image */}
            <div className="h-40 relative overflow-hidden">
               <img src={MEMBERSHIP_PLANS.student.image} alt="Gym Weights" className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
               <div className="absolute bottom-4 left-4 text-white">
                 <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter">STUDENT</h3>
               </div>
            </div>

            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 leading-relaxed text-brand-charcoal dark:text-white">Current High School or<br/>College Student</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-center rounded shadow-inner">
                <div className="text-4xl font-bold text-brand-red">$29</div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Monthly</div>
                <div className="text-[10px] text-neutral-400 mt-1 pt-1">+ $39 One-Time Setup Fee</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth onClick={() => handleJoin('student')}>Join Now</Button>
            </div>
          </Card>

          {/* 1 YEAR PAID IN FULL */}
          <Card className="p-0 overflow-hidden flex flex-col shadow-2xl scale-100 md:scale-95 transition-transform hover:scale-100">
            {/* Header Image */}
            <div className="h-40 relative overflow-hidden">
               <img src={MEMBERSHIP_PLANS.annual.image} alt="Full Facility" className="w-full h-full object-cover object-[center_30%] transition-transform duration-500 hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
               <div className="absolute bottom-4 left-4 text-white">
                 <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter">1 YEAR PAID IN<br/>FULL</h3>
               </div>
            </div>

            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 leading-relaxed text-brand-charcoal dark:text-white">Full Year Paid Up<br/>Front</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-center rounded shadow-inner">
                <div className="text-4xl font-bold text-brand-red">$360</div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">1 Year</div>
                <div className="text-[10px] text-neutral-400 mt-1 pt-1">No setup fee</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth onClick={() => handleJoin('annual')}>Join Now</Button>
            </div>
          </Card>
        </div>

        {/* PROMO FOOTER */}
        <div className="mt-20 text-center space-y-2">
          <p className="text-3xl md:text-5xl font-bold italic text-brand-red uppercase tracking-tighter font-graffiti">No Long Term Contracts!</p>
          <p className="text-3xl md:text-5xl font-bold italic text-brand-red uppercase tracking-tighter font-graffiti">No Annual Fees!</p>
        </div>
      </Section>

      <Section bg="alternate">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">Membership FAQ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">Why is there a setup fee?</h4>
                <p className="text-neutral-500">The $39 setup fee covers your initial onboarding, mobile app activation, and administrative setup to get you 24/7 access immediately.</p>
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
