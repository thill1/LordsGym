import React from 'react';
import Section from '../components/Section';
import GHLForm from '../components/GHLForm';

const Contact: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="pt-32 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Visit Us</h1>
        <p className="text-xl text-neutral-300">Come experience the difference.</p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <div className="fade-in">
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <div className="space-y-6 text-lg">
              <div>
                <h3 className="font-bold text-black dark:text-white uppercase tracking-wider text-sm mb-1">Address</h3>
                <p>258 Elm Ave<br/>Auburn, CA 95603</p>
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white uppercase tracking-wider text-sm mb-1">Phone</h3>
                <p>530-537-2105</p>
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white uppercase tracking-wider text-sm mb-1">Email</h3>
                <p>info@lordsgymauburn.com</p>
              </div>
              
              <div className="pt-8">
                <h3 className="font-bold text-black dark:text-white uppercase tracking-wider text-sm mb-4">Operating Hours</h3>
                <ul className="space-y-2">
                   <li className="flex justify-between max-w-xs border-b border-neutral-200 dark:border-neutral-700 pb-1 font-bold"><span>Member Access</span> <span>24 HOURS / 7 DAYS</span></li>
                   <li className="flex justify-between max-w-xs border-b border-neutral-200 dark:border-neutral-700 pb-1 mt-4"><span>Staffed: Mon - Fri</span> <span>8:00 AM - 8:00 PM</span></li>
                   <li className="flex justify-between max-w-xs border-b border-neutral-200 dark:border-neutral-700 pb-1"><span>Staffed: Sat - Sun</span> <span>9:00 AM - 2:00 PM</span></li>
                </ul>
                <p className="text-xs text-neutral-500 mt-2 italic text-balance">Staffed hours are for tours, sign-ups, and merchandise sales.</p>
              </div>
            </div>
          </div>

          {/* Form Side - GHL INTEGRATION */}
          <div className="fade-in">
            <GHLForm />
          </div>
        </div>
      </Section>
      
      {/* Map Section */}
      <div className="h-96 w-full bg-neutral-200 dark:bg-neutral-800 relative flex items-center justify-center grayscale">
         {/* In production, replace with Google Maps iframe */}
         <div className="text-center px-4">
            <p className="text-neutral-500 font-bold mb-2">258 Elm Ave, Auburn, CA 95603</p>
            <p className="text-xs text-neutral-400">Interactive Map Loading...</p>
         </div>
      </div>
    </>
  );
};

export default Contact;