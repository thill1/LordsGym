import React from 'react';
import Section from '../components/Section';
import Card from '../components/Card';
import { MINDBODY_MEMBERSHIP_URL, MINDBODY_PASSES_URL } from '../constants';

const HERO_IMAGE = `${import.meta.env.BASE_URL || '/'}media/outreach/outreach-community.jpg.jpeg`.replace(/\/\/+/g, '/');

const getFacilityImage = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}media/facility/${filename}`;
};

const IMAGES = {
  cardioArea: getFacilityImage('gym-weight-machines.avif'),
  freeWeights: getFacilityImage('gym-squat-racks.avif'),
  fullFacility: getFacilityImage('gym-multi-station.avif'),
};

interface MembershipOption {
  id: string;
  name: string;
  price: string;
  period: string;
  detail: string;
  features: string[];
  image: string;
  href: string;
  cta: string;
  external?: boolean;
}

// Keep this selector aligned with the customer-facing options currently listed
// in Lord's Gym's live Mindbody Branded Web catalog. Internal/test products in
// Mindbody are intentionally not advertised here.
const MEMBERSHIP_OPTIONS: MembershipOption[] = [
  {
    id: 'monthly',
    name: 'Month to Month',
    price: '$39',
    period: '/mo',
    detail: 'Billed monthly',
    features: ['1 item', 'Month to month'],
    image: IMAGES.cardioArea,
    href: MINDBODY_MEMBERSHIP_URL,
    cta: 'View Membership Options',
    external: true,
  },
  {
    id: 'coaching',
    name: 'Online Coaching',
    price: '$149',
    period: '/mo',
    detail: 'Billed monthly',
    features: ['1 item', 'Month to month'],
    image: IMAGES.fullFacility,
    href: MINDBODY_MEMBERSHIP_URL,
    cta: 'View Coaching Options',
    external: true,
  },
  {
    id: 'one-month',
    name: '1 Month Only',
    price: '$59.99',
    period: '',
    detail: '',
    features: ['Unlimited sessions', 'Expires 1 month after purchase'],
    image: IMAGES.cardioArea,
    href: MINDBODY_PASSES_URL,
    cta: 'View Pass Options',
    external: true,
  },
  {
    id: 'annual',
    name: '1 Year Paid In Full',
    price: '$350',
    period: '',
    detail: '',
    features: ['Unlimited sessions', 'Expires 12 months after purchase'],
    image: IMAGES.fullFacility,
    href: MINDBODY_PASSES_URL,
    cta: 'View Annual Option',
    external: true,
  },
  {
    id: 'day-pass',
    name: 'Day Pass',
    price: '$10',
    period: '',
    detail: '',
    features: ['Single session'],
    image: IMAGES.freeWeights,
    href: MINDBODY_PASSES_URL,
    cta: 'Buy a Day Pass',
    external: true,
  },
];

const Membership: React.FC = () => {
  return (
    <>
      <Section
        bg="image"
        bgImage={HERO_IMAGE}
        bgImagePosition="center top"
        bgImageFetchPriority="high"
        className="min-h-[55vh] flex items-center justify-center text-center pt-32 pb-24"
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="relative inline-block mb-4">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">MEMBERSHIPS & PASSES</h1>
            <span className="absolute -right-6 -top-4 border border-white/20 text-white bg-brand-red px-2 py-1 rotate-12 font-bold uppercase tracking-widest text-xs shadow-lg">Join Us</span>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mt-4 drop-shadow-md">
            Choose your option here, then complete your purchase securely in Mindbody.
          </p>
        </div>
      </Section>

      <Section className="bg-neutral-100 dark:bg-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-32">
          {MEMBERSHIP_OPTIONS.map((option) => (
            <Card
              key={option.id}
              className="p-0 overflow-hidden flex flex-col shadow-2xl relative transition-transform hover:-translate-y-1"
            >
              <div className="h-40 relative overflow-hidden">
                <img
                  src={option.image}
                  alt="Lord's Gym facility"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold leading-tight uppercase tracking-tighter">{option.name}</h2>
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col bg-white dark:bg-neutral-800">
                <ul className="space-y-4 text-center flex-grow">
                  {option.features.map((feature) => (
                    <li
                      key={feature}
                      className="font-bold text-sm uppercase tracking-wider border-b pb-4 border-neutral-200 dark:border-neutral-700 text-brand-charcoal dark:text-white"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-center rounded shadow-inner">
                  <div className="text-4xl font-bold text-brand-red">
                    {option.price}<span className="text-sm text-neutral-500">{option.period}</span>
                  </div>
                  {option.detail && (
                    <div className="text-[10px] text-neutral-500 mt-1 pt-1 uppercase tracking-wider">{option.detail}</div>
                  )}
                </div>
                <a
                  href={option.href}
                  target={option.external ? '_blank' : undefined}
                  rel={option.external ? 'noopener noreferrer' : undefined}
                  className="mt-6 inline-flex items-center justify-center font-bold tracking-wider uppercase w-full min-h-[44px] px-6 py-3 bg-neutral-900 text-white border border-neutral-700 hover:bg-brand-red hover:border-brand-red hover:text-white shadow-lg rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  {option.cta}
                </a>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center max-w-3xl mx-auto">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Mindbody is Lord&apos;s Gym&apos;s secure membership system. Its pricing page lets you review the available membership, coaching, annual, monthly, and day-pass options before purchasing.
          </p>
        </div>
      </Section>

      <Section bg="alternate">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Membership FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <h3 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">Where do I complete my purchase?</h3>
              <p className="text-neutral-500">Online purchases are completed on Lord&apos;s Gym&apos;s secure Mindbody pricing page. You can review the available options before checking out.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">How does 24/7 access work?</h3>
              <p className="text-neutral-500">Members receive secure mobile-app access that unlocks the front doors at any time, day or night.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">Need help choosing?</h3>
              <p className="text-neutral-500">Call 530-537-2105 or visit during staffed hours and the Lord&apos;s Gym team will help you select the right option.</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Membership;
