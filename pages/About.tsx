import React from "react";
import Section from "../components/Section";
import Button from "../components/Button";

const About: React.FC = () => {
  // ✅ Local hero image (GitHub Pages-safe)
  // File path in repo: public/media/lords-gym/LordsGym1.png
  const HERO_IMAGE = new URL(
    "media/lords-gym/LordsGym1.png",
    import.meta.env.BASE_URL
  ).toString();

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <>
      {/* Hero */}
      <Section bg="image" bgImage={HERO_IMAGE} className="pt-32 pb-32 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-white/80 font-bold tracking-[0.2em] uppercase text-sm mb-4">
            Auburn, CA • Faith • Strength • Community
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight drop-shadow-xl">
            About Lord&apos;s Gym
          </h1>
          <p className="text-lg md:text-xl text-white/80 mt-6 max-w-2xl mx-auto">
            Building Strength, Inside and Out. A mission-driven gym dedicated to character,
            fitness, and community in Auburn, CA.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Button size="lg" variant="brand" onClick={() => navigate("/membership")}>
              Join Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brand-charcoal"
              onClick={() => navigate("/contact")}
            >
              Book a Tour
            </Button>
          </div>
        </div>
      </Section>

      {/* Body */}
      <Section className="bg-brand-offWhite dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-charcoal dark:text-white mb-6">
            Our Mission
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed">
            Lord&apos;s Gym exists to serve people—body, mind, and spirit. We train hard,
            support one another, and build a community rooted in faith, discipline, and purpose.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200/70 dark:border-neutral-800">
              <h3 className="font-bold text-brand-charcoal dark:text-white mb-2">Faith First</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                We put character and purpose at the center of everything we do.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200/70 dark:border-neutral-800">
              <h3 className="font-bold text-brand-charcoal dark:text-white mb-2">Train With Intention</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Strength training, conditioning, and coaching that meet you where you are.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200/70 dark:border-neutral-800">
              <h3 className="font-bold text-brand-charcoal dark:text-white mb-2">Community Outreach</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                We believe fitness and accountability change lives—together.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default About;
