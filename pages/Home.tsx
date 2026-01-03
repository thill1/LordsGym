import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import { FEATURED_PRODUCTS } from '../constants';
import ShopifyProduct from '../components/ShopifyProduct';

interface HomeProps {
  onNavigate: (path: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center bg-black">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=1920&q=80" 
            alt="Weightlifting" 
            className="w-full h-full object-cover grayscale opacity-60"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl">
            <div className="inline-block border-l-4 border-brand-red pl-4 mb-6">
              <p className="text-white font-bold tracking-widest uppercase text-sm">Founded in Faith. Forged in Iron.</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Train with Purpose. <br/>
              <span className="text-neutral-400">Live with <span className="text-brand-red">Faith.</span></span>
            </h1>
            <p className="text-xl text-neutral-300 mb-8 max-w-lg">
              Welcome to Lord's Gym Auburn. A premium 24/7 community dedicated to building strength inside and out.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="brand" onClick={() => onNavigate('/membership')}>
                Start Your Free Visit
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => onNavigate('/shop')}>
                Shop Merch
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Spotlight (Shopify) */}
      <Section id="shop-preview">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Faith & Fitness <span className="text-brand-red">Apparel</span></h2>
            <p className="text-neutral-500">Wear your testimony. High-quality gear for the gym and the streets.</p>
          </div>
          <Button variant="ghost" className="hover:text-brand-red" onClick={() => onNavigate('/shop')}>View All Products &rarr;</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_PRODUCTS.map((product) => (
            <ShopifyProduct key={product.id} product={product} />
          ))}
        </div>
      </Section>

      {/* Testimonial Feature */}
      <Section bg="alternate">
        <div className="max-w-4xl mx-auto text-center">
           <div className="text-5xl mb-8 text-brand-red">"</div>
           <p className="text-2xl font-light italic text-neutral-600 dark:text-neutral-300 mb-8">
             "Iron sharpens iron, and one man sharpens another. I found more than a workout at Lord's Gym; I found a brotherhood and a place to grow my character as much as my strength."
           </p>
           <h4 className="font-bold uppercase tracking-widest text-sm">Member Spotlight</h4>
           <p className="text-xs text-neutral-500 mt-1">Auburn, CA</p>
        </div>
      </Section>

      {/* Call to Action */}
      <Section bg="image" bgImage="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80" className="text-center py-32">
        <h2 className="text-5xl font-bold mb-6 text-white uppercase">Ready to Train With <span className="text-brand-red">Purpose?</span></h2>
        <p className="text-xl text-neutral-200 mb-8">Join a community that fights for you, not against you.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <Button size="lg" variant="brand" onClick={() => onNavigate('/membership')}>Join Now</Button>
           <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => onNavigate('/contact')}>Book a Tour</Button>
        </div>
      </Section>
    </>
  );
};

export default Home;