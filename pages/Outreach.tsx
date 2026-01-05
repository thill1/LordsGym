
import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import { SQUARE_DONATION_URL } from '../constants';

// Helper function to get outreach image path
const getOutreachImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/outreach/${filename}`;
};

// Helper function to get hero image path
const getHeroImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/hero/${filename}`;
};

const IMAGES = {
  hero: getHeroImage('hero-background.jpg.jpg'), // Hero background
  trailer: getOutreachImage('outreach-trailer.jpg.jpeg'), // Trailer/Distribution vibe
  outreach: getOutreachImage('outreach-walking.jpg.JPG'), // Walking to tents
  prayer: getOutreachImage('outreach-prayer.jpg.jpeg'), // Prayer Circle
  hug: getOutreachImage('outreach-brotherhood.jpg.jpeg'), // Brotherhood/Support
  community: getOutreachImage('outreach-community.jpg') // Community photo (bottom section)
};

const Outreach: React.FC = () => {
  return (
    <>
      {/* Hero */}
      <Section bg="image" bgImage={IMAGES.hero} className="min-h-[70vh] flex items-center justify-center text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-brand-charcoal z-0"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 text-white uppercase tracking-tight shadow-black drop-shadow-lg">
            Restoring <span className="text-brand-red">Hope</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-200 mb-12 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Meeting our neighbors exactly where they are. Providing food, connection, and a path to recovery for those battling addiction and hardship.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
             <Button 
               size="lg" 
               variant="brand" 
               onClick={() => window.open(SQUARE_DONATION_URL, '_blank')}
               className="shadow-xl transform hover:scale-105 transition-all text-lg px-10"
             >
               Donate Today
             </Button>
          </div>
        </div>
      </Section>

      {/* Photo Grid (Representing the real-world impact) */}
      <Section className="py-20 bg-neutral-100 dark:bg-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Photo 1: Trailer/Distribution */}
            <div className="relative group overflow-hidden rounded-lg aspect-[4/5] md:aspect-square lg:aspect-[3/4]">
                <img src={IMAGES.trailer} alt="Distribution Trailer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <p className="text-white font-bold uppercase tracking-widest text-sm">Essentials</p>
                </div>
            </div>
            {/* Photo 2: Walking to tents */}
            <div className="relative group overflow-hidden rounded-lg aspect-[4/5] md:aspect-square lg:aspect-[3/4] mt-8 lg:mt-0">
                <img src={IMAGES.outreach} alt="Encampment Outreach" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <p className="text-white font-bold uppercase tracking-widest text-sm">Outreach</p>
                </div>
            </div>
            {/* Photo 3: Prayer */}
            <div className="relative group overflow-hidden rounded-lg aspect-[4/5] md:aspect-square lg:aspect-[3/4]">
                <img src={IMAGES.prayer} alt="Prayer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <p className="text-white font-bold uppercase tracking-widest text-sm">Prayer</p>
                </div>
            </div>
             {/* Photo 4: Embrace */}
            <div className="relative group overflow-hidden rounded-lg aspect-[4/5] md:aspect-square lg:aspect-[3/4] mt-8 lg:mt-0">
                <img src={IMAGES.hug} alt="Brotherhood" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <p className="text-white font-bold uppercase tracking-widest text-sm">Brotherhood</p>
                </div>
            </div>
        </div>
      </Section>

      {/* Mission Text: Food/Essentials */}
      <Section className="py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 fade-in">
             <h2 className="text-4xl font-bold text-brand-charcoal dark:text-white uppercase tracking-tight">
                More Than Just <span className="text-brand-red">Supplies</span>
             </h2>
             <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
               Every week, we load up and go out to the camps, the riverbeds, and the streets. We bring fresh produce, hot meals, hygiene kits, and clothing. But the most important thing we bring is <span className="font-bold text-brand-charcoal dark:text-white">presence</span>.
             </p>
             <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
               We believe that dignity begins with a name and a handshake. By consistently showing up, rain or shine, we build the trust necessary to help our friends take the next step toward stability.
             </p>
        </div>
      </Section>
      
      {/* Addiction & Recovery Section */}
      <Section bg="dark" className="py-24 relative overflow-hidden">
         {/* Background accent - reduced opacity and blur */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none"></div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 fade-in">
               <div className="inline-flex items-center gap-2 border-l-2 border-white/30 pl-4">
                  <span className="text-white font-bold tracking-widest uppercase text-sm">Recovery Ministry</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase leading-none">
                  Breaking the <span className="text-brand-red">Chains</span>
               </h2>
               <p className="text-xl text-neutral-300 font-light">
                  Addiction is a battle no one should fight alone. We offer a faith-based approach to the 12 Steps, supporting recovery through AA and NA principles.
               </p>
               <ul className="space-y-4 mt-4">
                  <li className="flex items-start">
                     <svg className="w-6 h-6 text-white mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <div>
                        <strong className="text-white block">A Safe Harbor</strong>
                        <span className="text-neutral-400 text-sm">A judgment-free zone where sobriety is celebrated and relapse is met with grace and renewed commitment.</span>
                     </div>
                  </li>
                  <li className="flex items-start">
                     <svg className="w-6 h-6 text-white mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                     </svg>
                     <div>
                        <strong className="text-white block">Community & Sponsorship</strong>
                        <span className="text-neutral-400 text-sm">Connecting those in early recovery with mentors who have walked the path before them.</span>
                     </div>
                  </li>
                  <li className="flex items-start">
                     <svg className="w-6 h-6 text-white mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                     </svg>
                     <div>
                        <strong className="text-white block">The Big Book & The Good Book</strong>
                        <span className="text-neutral-400 text-sm">Integrating the wisdom of Alcoholics Anonymous with the transforming power of scripture.</span>
                     </div>
                  </li>
               </ul>
            </div>
            <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
               <img src={IMAGES.community} alt="Community" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 hover:opacity-80 transition-opacity" />
               <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal to-transparent"></div>
               <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-xl italic font-serif text-white mb-4">
                    "My grace is sufficient for you, for my power is made perfect in weakness."
                  </p>
                  <p className="text-brand-red font-bold uppercase text-sm tracking-widest">— 2 Corinthians 12:9</p>
               </div>
            </div>
         </div>
      </Section>

      {/* Donation CTA */}
      <Section bg="default" className="text-center py-24">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-brand-charcoal dark:text-white uppercase">Fuel the Mission</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12">
               Your generosity fills gas tanks, buys sleeping bags, and provides AA/NA literature for those seeking a new life.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
               <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg">
                  <div className="text-4xl font-bold text-brand-charcoal dark:text-white mb-2">$25</div>
                  <p className="text-neutral-500 text-sm">Hygiene kits and socks for 5 people.</p>
               </div>
               <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg transform md:-translate-y-4">
                  <div className="text-4xl font-bold text-brand-charcoal dark:text-white mb-2">$50</div>
                  <p className="text-neutral-500 text-sm">Recovery bibles and workbooks for a small group.</p>
               </div>
               <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg">
                  <div className="text-4xl font-bold text-brand-charcoal dark:text-white mb-2">$100</div>
                  <p className="text-neutral-500 text-sm">Gas for the outreach truck for one week.</p>
               </div>
            </div>
            
            <Button 
               size="lg" 
               onClick={() => window.open(SQUARE_DONATION_URL, '_blank')}
               className="px-12 py-4 text-xl"
             >
               Donate
             </Button>
         </div>
      </Section>
    </>
  );
};

export default Outreach;
