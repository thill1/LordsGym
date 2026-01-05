import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';

const About: React.FC = () => {
  // ✅ GitHub Pages-safe PUBLIC asset path
  const HERO_IMAGE = `${import.meta.env.BASE_URL}media/lords-gym/LordsGym1.png`;

  const navigate = (path: string) => {
    window.location.hash = path;
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Section bg="image" bgImage={HERO_IMAGE} className="pt-32 pb-32 text-center">
        <div className="max-w-4xl mx-auto backdrop-blur-sm bg-black/45 p-10 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white uppercase tracking-wider">
            About Lord&apos;s Gym
          </h1>
          <p className="text-neutral-200 mt-6 text-lg md:text-xl leading-relaxed">
            Lord&apos;s Gym is a mission-driven fitness community in Auburn, CA — built on faith, forged in discipline,
            and focused on building strength inside and out.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="brand" onClick={() => navigate('/membership')}>
              Join Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brand-charcoal"
              onClick={() => navigate('/contact')}
            >
              Book a Tour
            </Button>
          </div>
        </div>
      </Section>

      <Section className="bg-brand-offWhite dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-brand-charcoal dark:text-white">Our Mission</h2>
          <p className="text-neutral-600 dark:text-neutral-300 mt-4 text-lg leading-relaxed">
            We train hard, live accountable, and grow together — body, mind, and spirit. Whether you&apos;re brand new or
            experienced, you&apos;ll find a place here.
          </p>
        </div>
      </Section>
    </>
  );
};

export default About;
