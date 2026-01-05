import React from "react";
import Section from "../components/Section";
import Button from "../components/Button";
import { useStore } from "../context/StoreContext";

interface AboutProps {
  onNavigate?: (path: string) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  const navigate =
    onNavigate ??
    ((path: string) => {
      window.location.hash = path;
    });

  // GitHub Pages-safe public asset URL (no new URL())
  const HERO_IMAGE = `${import.meta.env.BASE_URL}media/lords-gym/LordsGym1.png`;

  return (
    <>
      <Section bg="image" bgImage={HERO_IMAGE} className="pt-32 pb-32 text-center">
        <div className="max-w-4xl mx-auto backdrop-blur-sm bg-black/40 p-10 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-white uppercase leading-none drop-shadow-xl">
            About Lord’s Gym
          </h1>
          <p className="text-lg md:text-xl text-neutral-100 mb-8 font-light drop-shadow-md">
            Strength training built on faith, discipline, and community. Real people. Real transformation.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="brand" onClick={() => navigate("/membership")} className="min-w-[220px]">
              View Memberships
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black min-w-[220px]" onClick={() => navigate("/contact")}>
              Book a Tour
            </Button>
          </div>

          <div className="mt-10 text-sm text-neutral-200">
            <div className="font-bold tracking-widest uppercase">Contact</div>
            <div className="mt-2">
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
