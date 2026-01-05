import React from "react";
import Section from "../components/Section";
import Button from "../components/Button";
import { useStore } from "../context/StoreContext";

const About: React.FC = () => {
  const { settings } = useStore();

  const go = (path: string) => {
    window.location.hash = path;
  };

  return (
    <>
      <Section className="bg-brand-charcoal text-white pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tight">
            About Lord’s Gym
          </h1>

          <p className="mt-6 text-lg md:text-xl text-neutral-200 max-w-3xl">
            A faith-centered training community built on discipline, purpose, and brotherhood.
            Real coaching. Real accountability. Real transformation.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="brand" onClick={() => go("/membership")} className="min-w-[220px]">
              View Memberships
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black min-w-[220px]"
              onClick={() => go("/contact")}
            >
              Book a Tour
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-neutral-300">
            <div className="font-bold uppercase tracking-widest text-neutral-200">Contact</div>
            <div className="mt-2 space-y-1">
              <div>{settings?.contactPhone}</div>
              <div>{settings?.contactEmail}</div>
              <div>{settings?.address}</div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default About;
