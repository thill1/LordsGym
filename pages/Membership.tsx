import React from 'react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import MindbodyWidget from '../components/MindbodyWidget';

const Membership: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="text-center pt-32 pb-16">
        <h1 className="text-5xl font-bold mb-4">Membership Plans</h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
          No hidden fees. No long-term contracts. Just access to the best equipment and community in Auburn.
        </p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-24">
          {/* Plan 1 */}
          <Card className="relative pt-12 flex flex-col items-center text-center">
            <h3 className="text-xl font-bold uppercase tracking-widest text-neutral-500 mb-2">Day Pass</h3>
            <div className="text-4xl font-bold mb-6 text-brand-charcoal dark:text-white">$15<span className="text-lg text-neutral-400 font-normal">/day</span></div>
            <ul className="space-y-3 mb-8 text-sm text-left w-full px-4">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Full Gym Access</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Locker Room Access</li>
              <li className="flex items-center"><span className="text-neutral-300 mr-2">×</span> Group Classes</li>
            </ul>
            <Button variant="outline" fullWidth>Buy Pass</Button>
          </Card>

          {/* Plan 2 (Featured) */}
          <div className="bg-brand-charcoal text-white border-4 border-brand-gold shadow-2xl p-8 rounded-lg transform md:-translate-y-4 relative flex flex-col items-center text-center">
            <div className="absolute top-0 bg-brand-gold text-white text-xs font-bold px-3 py-1 uppercase tracking-wider transform -translate-y-1/2 rounded">Most Popular</div>
            <h3 className="text-2xl font-bold uppercase tracking-widest text-brand-gold mb-2">Standard</h3>
            <div className="text-5xl font-bold mb-6">$45<span className="text-lg text-neutral-400 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-10 text-sm text-left w-full px-4">
              <li className="flex items-center"><span className="text-brand-gold mr-2">✓</span> Unlimited Gym Access</li>
              <li className="flex items-center"><span className="text-brand-gold mr-2">✓</span> 5am - 10pm Access</li>
              <li className="flex items-center"><span className="text-brand-gold mr-2">✓</span> 1 Guest Pass / Month</li>
              <li className="flex items-center"><span className="text-neutral-500 mr-2">×</span> Unlimited Classes</li>
            </ul>
            <Button variant="primary" fullWidth size="lg">Join Now</Button>
            <p className="mt-4 text-xs text-neutral-400">billed monthly. cancel anytime.</p>
          </div>

          {/* Plan 3 */}
          <Card className="relative pt-12 flex flex-col items-center text-center">
            <h3 className="text-xl font-bold uppercase tracking-widest text-neutral-500 mb-2">All Access</h3>
            <div className="text-4xl font-bold mb-6 text-brand-charcoal dark:text-white">$75<span className="text-lg text-neutral-400 font-normal">/mo</span></div>
            <ul className="space-y-3 mb-8 text-sm text-left w-full px-4">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Unlimited Gym Access</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Unlimited Group Classes</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Sauna & Recovery Zone</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Merch Discount (10%)</li>
            </ul>
            <Button variant="outline" fullWidth>Join Now</Button>
          </Card>
        </div>
      </Section>

      <Section bg="alternate">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Membership FAQ</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg mb-2">Is there an initiation fee?</h4>
                <p className="text-neutral-500">We have a small $25 setup fee to cover your keycard and administrative setup. Occasionally we waive this during promotions!</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Do I have to be Christian to join?</h4>
                <p className="text-neutral-500">Absolutely not. Lord's Gym is open to everyone, regardless of faith, background, or walk of life. We are a Christian organization, so you'll see our values in action, but all are welcome.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Can I freeze my membership?</h4>
                <p className="text-neutral-500">Yes, you can freeze your membership for up to 3 months per year for medical or travel reasons.</p>
              </div>
            </div>
          </div>
          <div className="h-full">
            <MindbodyWidget title="New Member Sign Up" type="enrollment" />
          </div>
        </div>
      </Section>
    </>
  );
};

export default Membership;