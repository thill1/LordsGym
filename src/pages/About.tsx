import React from 'react';
import Section from '../components/Section';
import Card from '../components/Card';

const About: React.FC = () => {
  return (
    <>
      <Section bg="image" bgImage="https://images.unsplash.com/photo-1540497077202-7c8a33801524?auto=format&fit=crop&w=1920&q=80" className="pt-32 pb-32 text-center">
        <h1 className="text-6xl font-bold mb-6 text-white">Our Story</h1>
        <p className="text-2xl max-w-2xl mx-auto text-white">More than a gym. A movement.</p>
      </Section>

      <Section>
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-black dark:text-white">The Mission</h2>
            <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              Lord's Gym Auburn was established to provide a safe, positive environment for people to get fit, find community, and experience the love of God. We believe that physical discipline translates to spiritual strength. Our facility is a non-profit ministry, meaning every dollar spent here goes back into keeping the lights on and feeding our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-neutral-100 dark:bg-neutral-800 p-8 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-bold mb-4">Core Values</h3>
                <ul className="space-y-2">
                  <li className="flex items-center"><span className="text-black dark:text-white mr-2 font-bold">✦</span> Humility in Strength</li>
                  <li className="flex items-center"><span className="text-black dark:text-white mr-2 font-bold">✦</span> Excellence in Service</li>
                  <li className="flex items-center"><span className="text-black dark:text-white mr-2 font-bold">✦</span> Radical Generosity</li>
                  <li className="flex items-center"><span className="text-black dark:text-white mr-2 font-bold">✦</span> Unwavering Faith</li>
                </ul>
             </div>
             <div>
               <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80" alt="Community" className="rounded-lg shadow-lg w-full h-full object-cover grayscale" />
             </div>
          </div>

          <div>
             <h2 className="text-3xl font-bold mb-8 text-center">Leadership</h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
               <Card className="text-center">
                 <div className="w-24 h-24 mx-auto bg-neutral-200 rounded-full mb-4 overflow-hidden grayscale">
                   <img src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=200&q=80" alt="Head Coach" className="w-full h-full object-cover" />
                 </div>
                 <h4 className="font-bold text-lg">Mark D.</h4>
                 <p className="text-sm text-neutral-500 uppercase tracking-wide mb-2">Head Coach</p>
                 <p className="text-sm text-neutral-500">CrossFit Level 2 Trainer with a heart for youth mentorship.</p>
               </Card>
               <Card className="text-center">
                 <div className="w-24 h-24 mx-auto bg-neutral-200 rounded-full mb-4 overflow-hidden grayscale">
                   <img src="https://images.unsplash.com/photo-1611672585731-fa1060a80330?auto=format&fit=crop&w=200&q=80" alt="Nutritionist" className="w-full h-full object-cover" />
                 </div>
                 <h4 className="font-bold text-lg">Sarah J.</h4>
                 <p className="text-sm text-neutral-500 uppercase tracking-wide mb-2">Nutrition & Wellness</p>
                 <p className="text-sm text-neutral-500">Helping members fuel their bodies for performance and life.</p>
               </Card>
               <Card className="text-center">
                 <div className="w-24 h-24 mx-auto bg-neutral-200 rounded-full mb-4 overflow-hidden grayscale">
                   <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=200&q=80" alt="Outreach Director" className="w-full h-full object-cover" />
                 </div>
                 <h4 className="font-bold text-lg">David R.</h4>
                 <p className="text-sm text-neutral-500 uppercase tracking-wide mb-2">Outreach Director</p>
                 <p className="text-sm text-neutral-500">Connecting the gym to the streets through service.</p>
               </Card>
             </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default About;