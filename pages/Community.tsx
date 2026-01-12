import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';

const Community: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Community Outreach</h1>
          <p className="text-xl text-neutral-300">
            "For even the Son of Man did not come to be served, but to serve." — Mark 10:45
          </p>
        </div>
      </Section>

      <Section>
        <div className="space-y-24">
          {/* Initiative 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="w-full md:w-1/2">
               <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80" alt="Food Distribution" className="rounded-lg shadow-xl grayscale" />
             </div>
             <div className="w-full md:w-1/2">
               <h2 className="text-3xl font-bold mb-4">The Lord's Table</h2>
               <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                 Hunger is a reality for many in Auburn. Every Saturday, we transform our parking lot into a food distribution center, providing fresh produce, canned goods, and prayer to over 500 families.
               </p>
               <Button>Volunteer This Saturday</Button>
             </div>
          </div>

          {/* Initiative 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
             <div className="w-full md:w-1/2">
               <img src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80" alt="Youth Outreach" className="rounded-lg shadow-xl grayscale" />
             </div>
             <div className="w-full md:w-1/2">
               <h2 className="text-3xl font-bold mb-4">Gloves Up, Guns Down</h2>
               <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                 Our youth mentorship program uses boxing and weightlifting to teach discipline, emotional control, and self-worth to at-risk teenagers. We provide a safe haven from the streets.
               </p>
               <Button variant="outline">Sponsor a Youth Athlete</Button>
             </div>
          </div>
        </div>
      </Section>

      <Section bg="alternate" className="text-center py-24">
        <h2 className="text-3xl font-bold mb-6">Partner With Us</h2>
        <p className="max-w-2xl mx-auto text-neutral-500 mb-8">
          We are always looking for local businesses, churches, and individuals to partner with us in our mission. Whether through financial support, equipment donation, or volunteering.
        </p>
        <Button size="lg" onClick={() => window.location.href = 'mailto:lordsgymoutreach@gmail.com'}>Contact Outreach Director</Button>
      </Section>
    </>
  );
};

export default Community;