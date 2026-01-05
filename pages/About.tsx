import React from 'react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';

const About: React.FC = () => {
  const { settings } = useStore();

  // ✅ GitHub Pages-safe public asset URL (NO new URL() runtime crash)
  // File path in repo: public/media/lords-gym/LordsGym1.png
  const HERO_IMAGE = `${import.meta.env.BASE_URL}media/lords-gym/LordsGym1.png`;

  return (
    <>
      {/* Hero */}
      <Section bg="image" bgImage={HERO_IMAGE} className="pt-32 pb-32 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white uppercase tracking-wider drop-shadow-xl">
            About {settings.siteName}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-100/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Building Strength, Inside and Out — a mission-driven gym rooted in faith, discipline, and community.
          </p>
        </div>
      </Section>

      {/* Content */}
      <Section className="bg-brand-offWhite dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8">
              <h3 className="text-xl font-display font-bold mb-3 text-brand-charcoal dark:text-white uppercase tracking-widest">
                Mission
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Train with purpose, live with faith. We help people grow stronger physically and spiritually through
                consistent training, mentorship, and a supportive culture.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-display font-bold mb-3 text-brand-charcoal dark:text-white uppercase tracking-widest">
                Community
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                You’re not training alone. We’re building a place where people belong — where discipline is celebrated,
                progress is coached, and everyone is welcome.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-display font-bold mb-3 text-brand-charcoal dark:text-white uppercase tracking-widest">
                Standards
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Excellence over excuses. Clean facility, strong equipment, clear coaching, and a culture that pushes you
                forward — without ego.
              </p>
            </Card>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="brand" onClick={() => (window.location.hash = '/membership')}>
              Join Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
              onClick={() => (window.location.hash = '/contact')}
            >
              Book a Tour
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
};

export default About;
