import React from 'react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import MindbodyWidget from '../components/MindbodyWidget';

const Membership: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="text-center pt-32 pb-24">
        <div className="relative inline-block mb-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter italic">MONTH-TO-MONTH</h1>
          <span className="absolute -right-4 -top-4 bg-brand-red text-white text-xs px-2 py-1 rotate-12 font-bold uppercase tracking-widest">Memberships</span>
        </div>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto mt-4">
          Join the community built on faith and forged in iron.
        </p>
      </Section>

      <Section className="bg-neutral-100 dark:bg-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-32">
          
          {/* REGULAR MONTHLY */}
          <Card className="p-0 overflow-hidden flex flex-col border-none shadow-2xl scale-100 md:scale-95 transition-transform hover:scale-100">
            <div className="bg-brand-red text-white p-6 text-center border-b-4 border-brand-redHover">
              <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter">REGULAR<br/>MONTHLY</h3>
            </div>
            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">Access to gym equipment</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-brand-red text-white p-4 text-center rounded shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-4xl font-bold">$39</div>
                <div className="text-xs font-bold uppercase tracking-widest">Monthly</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth>Join Now</Button>
            </div>
          </Card>

          {/* STUDENT (Featured/Middle) */}
          <Card className="p-0 overflow-hidden flex flex-col border-none shadow-2xl relative z-10 transition-transform hover:scale-105">
            <div className="bg-brand-red text-white p-6 text-center border-b-4 border-brand-redHover">
              <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter">STUDENT</h3>
            </div>
            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 leading-relaxed text-brand-charcoal dark:text-white">Current High School or<br/>College Student</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-brand-red text-white p-4 text-center rounded shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-4xl font-bold">$29</div>
                <div className="text-xs font-bold uppercase tracking-widest">Monthly</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth>Join Now</Button>
            </div>
          </Card>

          {/* 1 YEAR PAID IN FULL */}
          <Card className="p-0 overflow-hidden flex flex-col border-none shadow-2xl scale-100 md:scale-95 transition-transform hover:scale-100">
            <div className="bg-brand-red text-white p-6 text-center border-b-4 border-brand-redHover">
              <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter">1 YEAR PAID IN<br/>FULL</h3>
            </div>
            <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
              <ul className="space-y-6 text-center flex-grow">
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 leading-relaxed text-brand-charcoal dark:text-white">Full Year Paid Up<br/>Front</li>
                <li className="font-bold text-sm uppercase tracking-widest border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white">24 HR Access</li>
              </ul>
              <div className="mt-8 bg-brand-red text-white p-4 text-center rounded shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-4xl font-bold">$360</div>
                <div className="text-xs font-bold uppercase tracking-widest">1 Year</div>
              </div>
              <Button variant="brand" className="mt-6" fullWidth>Join Now</Button>
            </div>
          </Card>
        </div>

        {/* PROMO FOOTER */}
        <div className="mt-20 text-center space-y-2">
          <p className="text-3xl md:text-5xl font-bold italic text-brand-red uppercase tracking-tighter drop-shadow-sm">No Long Term Contracts!</p>
          <p className="text-3xl md:text-5xl font-bold italic text-brand-red uppercase tracking-tighter drop-shadow-sm">No Annual Fees!</p>
        </div>
      </Section>

      <Section bg="alternate">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Membership FAQ</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-red">How do I verify my Student status?</h4>
                <p className="text-neutral-500">Bring a valid student ID from any local high school or college (like Sierra College) during staffed hours to activate your discounted rate.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-red">How does 24/7 access work?</h4>
                <p className="text-neutral-500">Members receive a personal keycard (or mobile app access) that unlocks our front doors at any time, day or night, ensuring you can train on your schedule.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-red">Can I pay in cash?</h4>
                <p className="text-neutral-500">We prefer automated billing for monthly memberships, but our 1-year Paid In Full option can be handled via cash or check during staffed hours.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-brand-red">What does "No Annual Fees" mean?</h4>
                <p className="text-neutral-500">Unlike big-box gyms, we don't surprise you with an "equipment fee" or "maintenance fee" six months into your membership. Your monthly price is your price.</p>
              </div>
            </div>
          </div>
          <div className="h-full">
            <MindbodyWidget title="Start Your Membership" type="enrollment" />
          </div>
        </div>
      </Section>
    </>
  );
};

export default Membership;