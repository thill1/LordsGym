import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';

const About: React.FC = () => {
  const { settings } = useStore();

  // ✅ GitHub Pages-safe local hero path (NO new URL())
  // File path in repo: public/media/lords-gym/LordsGym1.png
  const HERO_IMAGE = `${import.meta.env.BASE_URL}media/lords-gym/LordsGym1.png`;

  return (
    <>
      <Section bg="image" bgImage={HERO_IMAGE} className="pt-32 pb-32 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 uppercase tracking-tight">
            About {settings.siteName}
          </h1>
          <p className="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            Building strength in body, mind, and spirit—through faith, community, and disciplined training.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="brand" onClick={() => (window.location.hash = '/membership')}>
              Join Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
              onClick={() => (window.location.hash = '/contact')}
            >
              Book a Tour
            </Button>
          </div>
        </div>
      </Section>

      <Section className="bg-white dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-charcoal dark:text-white">
            Our Mission
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-lg">
            We exist to serve Auburn with a gym that welcomes everyone, supports recovery, builds discipline, and keeps
            Christ at the center. Training is our tool—character is the goal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
              <h3 className="font-bold text-lg dark:text-white">Faith</h3>
              <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                A culture anchored in purpose, humility, and service.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
              <h3 className="font-bold text-lg dark:text-white">Community</h3>
              <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                We train together. We lift each other up.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
              <h3 className="font-bold text-lg dark:text-white">Discipline</h3>
              <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                Consistency creates confidence—and transformation.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default About;
