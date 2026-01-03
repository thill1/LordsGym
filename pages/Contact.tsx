
import React from 'react';
import Section from '../components/Section';
import ContactForm from '../components/ContactForm';

const Contact: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="pt-32 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-brand-red">Visit</span> <span className="text-white">Us</span>
        </h1>
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
                   <li className="flex justify-between w-full max-w-md border-b border-neutral-200 dark:border-neutral-700 pb-1 font-bold"><span>Member Access</span> <span>24 HOURS / 7 DAYS</span></li>
                   <li className="flex justify-between w-full max-w-md border-b border-neutral-200 dark:border-neutral-700 pb-1 mt-4 font-bold"><span>Staff seven days a week</span> <span className="whitespace-nowrap">7am-7pm</span></li>
                </ul>
                <p className="text-xs text-neutral-500 mt-2 italic text-balance">Staffed hours are for tours, sign-ups, and merchandise sales.</p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="fade-in">
            <ContactForm />
          </div>
        </div>
      </Section>
      
      {/* Map Section */}
      <div className="h-96 w-full bg-neutral-200 dark:bg-neutral-800 relative grayscale-[100%] hover:grayscale-0 transition-all duration-700">
         <iframe 
            width="100%" 
            height="100%" 
            src="https://maps.google.com/maps?q=258%20Elm%20Ave%2C%20Auburn%2C%20CA%2095603&t=&z=15&ie=UTF8&iwloc=&output=embed" 
            title="Lord's Gym Location"
            className="w-full h-full"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
         ></iframe>
         <div className="absolute inset-0 pointer-events-none border-t border-brand-red/20"></div>
      </div>
    </>
  );
};

export default Contact;
