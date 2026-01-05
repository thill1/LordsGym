import React from "react";
import Section from "../components/Section";
import Button from "../components/Button";
import { FEATURED_PRODUCTS } from "../constants";
import ShopifyProduct from "../components/ShopifyProduct";
import { useStore } from "../context/StoreContext";

interface HomeProps {
  // Optional so the build never fails if <Home /> is rendered without props anywhere
  onNavigate?: (path: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { homeContent } = useStore();
  const { hero, values } = homeContent;

  const navigate =
    onNavigate ??
    ((path: string) => {
      window.location.hash = path;
    });

  // GitHub Pages-safe public asset URL (NO new URL() runtime crash)
  // File path in repo: public/media/lords-gym/LordsGym1.png
  const HERO_BG_IMAGE = `${import.meta.env.BASE_URL}media/lords-gym/LordsGym1.png`;

  const GYM_FLOOR_IMAGE =
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80";

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          <img
            src={HERO_BG_IMAGE}
            alt="Lord's Gym Background"
            className="w-full h-full object-cover opacity-60 scale-105 transform transition-transform duration-[20s]"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 flex flex-col justify-center h-full">
          <div className="max-w-3xl fade-in fade-in-delay-1">
            <div className="inline-flex items-center gap-3 border-l-2 border-neutral-500 pl-4 mb-8">
              <span className="h-px w-8 bg-neutral-500 hidden sm:block"></span>
              <p className="text-white font-bold tracking-[0.2em] uppercase text-sm">
                Founded in Faith. Forged in Iron.
              </p>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-8 leading-none tracking-tight whitespace-pre-line">
              {hero.headline}
            </h1>

            <h2 className="text-lg md:text-xl text-neutral-300 mb-10 max-w-xl leading-relaxed font-light normal-case font-sans tracking-normal">
              {hero.subheadline}
            </h2>

            <div className="flex flex-col sm:flex-row gap-5">
              <Button
                size="lg"
                variant="brand"
                onClick={() => navigate("/membership")}
                className="shadow-2xl"
              >
                {hero.ctaText}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand-charcoal"
                onClick={() => navigate("/shop")}
              >
                Shop
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 text-white animate-bounce hidden md:block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Intro Stats / Values Section */}
      <section className="bg-brand-charcoal text-white py-12 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center divide-x divide-neutral-800">
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                {values.stat1}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-widest">
                {values.label1}
              </div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                {values.stat2}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-widest">
                {values.label2}
              </div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                {values.stat3}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-widest">
                {values.label3}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Spotlight (Shopify) */}
      <Section id="shop-preview" className="bg-brand-offWhite dark:bg-neutral-900">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-brand-charcoal dark:bg-white"></span>
              <span className="text-brand-charcoal dark:text-white font-bold uppercase tracking-widest text-sm">
                New Arrivals
              </span>
            </div>
            <h2 className="text-4xl font-bold text-brand-charcoal dark:text-white">
              Faith & Fitness <span className="text-brand-red">Apparel</span>
            </h2>
            <p className="text-neutral-500 mt-2 max-w-md">
              High-quality gear designed for the gym and the streets. Wear your testimony.
            </p>
          </div>
          <Button variant="ghost" className="group hover:text-brand-red" onClick={() => navigate("/shop")}>
            View All Products
            <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">
              &rarr;
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_PRODUCTS.map((product) => (
            <ShopifyProduct key={product.id} product={product} />
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <Section bg="image" bgImage={GYM_FLOOR_IMAGE} className="text-center py-40 !bg-top">
        <div className="max-w-3xl mx-auto backdrop-blur-sm bg-black/40 p-10 rounded-2xl border border-white/10 shadow-2xl">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 text-white uppercase leading-none drop-shadow-xl">
            Ready to Train With <span className="text-brand-red">Purpose?</span>
          </h2>
          <p className="text-xl md:text-2xl text-neutral-100 mb-10 font-light drop-shadow-md">
            Join a community that fights for you, not against you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="brand"
              onClick={() => navigate("/membership")}
              className="min-w-[200px]"
            >
              Join Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black min-w-[200px]"
              onClick={() => navigate("/contact")}
            >
              Book a Tour
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Home;
