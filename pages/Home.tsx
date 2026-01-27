import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import Card from '../components/Card';
import MetaTags from '../components/MetaTags';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import { useStore } from '../context/StoreContext';
import { FEATURED_PRODUCTS } from '../constants';
// ARCHIVED: Training Programs section removed - see pages/archived/HomeProgramsSection.tsx

interface HomeProps {
  onNavigate: (path: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { homeContent, testimonials } = useStore();

  const heroHeadline = homeContent?.hero?.headline || "TRAIN WITH PURPOSE.\nLIVE WITH FAITH.";
  const heroSubheadline = homeContent?.hero?.subheadline || "Our mission is to bring strength and healing to our community through fitness, Christ and service.";
  const heroCtaText = homeContent?.hero?.ctaText || "Join Now";
  const heroBgImage = homeContent?.hero?.backgroundImage || "https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=1920&q=80";
  
  // Helper to get CTA background image
  const getCtaImage = () => {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}media/hero/cta-background.jpg.png`;
  };
  const ctaBgImage = getCtaImage();

  const values = homeContent?.values || {
    stat1: "24/7", label1: "Access",
    stat2: "100%", label2: "Commitment",
    stat3: "1", label3: "Community"
  };

  return (
    <>
      <MetaTags
        title="Train with Purpose, Live with Faith"
        description={heroSubheadline}
        image={heroBgImage}
        path="/"
      />
      {/* Hero Section */}
      <Section bg="image" bgImage={heroBgImage} className="pt-20 pb-16 min-h-[600px] flex items-center">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 whitespace-pre-line">
            {heroHeadline}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-200 mb-8 max-w-2xl mx-auto">
            {heroSubheadline}
          </p>
          <Button 
            size="lg" 
            variant="brand" 
            onClick={() => onNavigate('/membership')}
            className="min-w-[200px] !bg-brand-red !text-white !border-brand-red hover:!bg-brand-charcoal hover:!border-brand-charcoal dark:!bg-brand-red dark:!text-white dark:!border-brand-red"
          >
            {heroCtaText}
          </Button>
        </div>
      </Section>

      {/* Values Section */}
      <Section className="bg-white dark:bg-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-brand-red mb-2 font-graffiti">{values.stat1}</div>
            <div className="text-lg font-semibold uppercase tracking-wider font-graffiti">{values.label1}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-brand-red mb-2 font-graffiti">{values.stat2}</div>
            <div className="text-lg font-semibold uppercase tracking-wider font-graffiti">{values.label2}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-brand-red mb-2 font-graffiti">{values.stat3}</div>
            <div className="text-lg font-semibold uppercase tracking-wider font-graffiti">{values.label3}</div>
          </div>
        </div>
      </Section>

      {/* ARCHIVED: Training Programs section removed - see pages/archived/HomeProgramsSection.tsx */}

      {/* New Arrivals Section */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">New Arrivals</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Show your support with our latest gear
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <div className="w-full h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{product.title}</h3>
                <p className="text-brand-red font-bold text-xl mb-3">${product.price.toFixed(2)}</p>
                <Button 
                  variant="brand" 
                  size="sm"
                  onClick={() => onNavigate('/shop')}
                  className="w-full"
                >
                  View Product
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => onNavigate('/shop')}
            className="hover:text-brand-red dark:hover:text-brand-red"
          >
            View All Products
          </Button>
        </div>
      </Section>

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <Section bg="dark">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">What Our Community Says</h2>
            <p className="text-lg text-neutral-300">
              Hear from members who train with purpose and live with faith
            </p>
          </div>
          <TestimonialsCarousel testimonials={testimonials} autoScrollInterval={5000} />
        </Section>
      )}

      {/* CTA Section */}
      <Section bg="image" bgImage={ctaBgImage} className="text-white relative">
        <div className="text-center max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-red-100">
            Join a community that trains with purpose and lives with faith.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => onNavigate('/membership')}
              className="!bg-brand-red !text-white !border-brand-red hover:!bg-brand-red hover:!text-white hover:!border-brand-red dark:!bg-brand-red dark:!text-white dark:!border-brand-red"
            >
              View Memberships
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('/contact')}
              className="border-white text-white hover:bg-white hover:text-brand-red"
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
