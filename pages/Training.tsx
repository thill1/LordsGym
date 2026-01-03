import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import MindbodyWidget from '../components/MindbodyWidget';

const Training: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="pt-32 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">1-on-1 Personal Training</h1>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
          Customized coaching to reach your spiritual and physical peak.
        </p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-black dark:text-white">Why 1-on-1?</h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Group classes are great, but sometimes you need a focused eye on your form, your nutrition, and your personal goals. Our trainers are mentors who walk alongside you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border-l-2 border-black dark:border-white pl-4">
                <h4 className="font-bold uppercase text-sm">Customized Plans</h4>
                <p className="text-sm text-neutral-500">Workouts tailored to your specific injuries, goals, and equipment access.</p>
              </div>
              <div className="border-l-2 border-black dark:border-white pl-4">
                <h4 className="font-bold uppercase text-sm">Accountability</h4>
                <p className="text-sm text-neutral-500">Regular check-ins to ensure you're staying disciplined in and out of the gym.</p>
              </div>
            </div>

            <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded">
              <h4 className="font-bold mb-2">New Client Special</h4>
              <p className="text-sm text-neutral-500 mb-4">Purchase 3 sessions and get the 4th free for your first month.</p>
              <Button variant="outline" size="sm">Claim Offer</Button>
            </div>
          </div>

          <div>
            <MindbodyWidget title="Book a Session" type="appointment" className="shadow-2xl" />
          </div>
        </div>
      </Section>
    </>
  );
};

export default Training;