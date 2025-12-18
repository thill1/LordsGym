import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';

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
          <div>
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <div className="space-y-6 text-lg">
              <div>
                <h3 className="font-bold text-black dark:text-white uppercase tracking-wider text-sm mb-1">Address</h3>
                <p>258 Elm Ave<br/>Auburn, CA 95603</p>
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white uppercase tracking-wider text-sm mb-1">Phone</h3>
                <p>(530) 555-0123</p>
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
                <p className="text-xs text-neutral-500 mt-2 italic">Staffed hours are for tours, sign-ups, and merchandise sales.</p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg border-t-4 border-black dark:border-white">
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold mb-2">Name</label>
                <input type="text" className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 border border-transparent focus:border-black dark:focus:border-white rounded outline-none transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input type="email" className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 border border-transparent focus:border-black dark:focus:border-white rounded outline-none transition-colors" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Interest</label>
                <select className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 border border-transparent focus:border-black dark:focus:border-white rounded outline-none transition-colors">
                  <option>Membership Inquiry</option>
                  <option>Schedule a Tour</option>
                  <option>Outreach / Volunteering</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Message</label>
                <textarea rows={4} className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 border border-transparent focus:border-black dark:focus:border-white rounded outline-none transition-colors" placeholder="How can we help you?"></textarea>
              </div>
              <Button fullWidth type="submit">Submit Inquiry</Button>
            </form>
          </div>
        </div>
      </Section>
      
      {/* Map Placeholder */}
      <div className="h-96 w-full bg-neutral-200 dark:bg-neutral-800 relative flex items-center justify-center grayscale">
         <p className="text-neutral-500 font-bold">Google Maps Embed Placeholder</p>
      </div>
    </>
  );
};

export default Contact;