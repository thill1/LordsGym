import React from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import Card from '../components/Card';
import { PROGRAMS, TESTIMONIALS, FEATURED_PRODUCTS, UPCOMING_CLASSES } from '../constants';
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
          {/* Gradient Overlay - reduced opacity to ensure image is visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl">
            <div className="inline-block border-l-4 border-white pl-4 mb-6">
              <p className="text-white font-bold tracking-widest uppercase text-sm">Founded in Faith. Forged in Iron.</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Train with Purpose. <br/>
              <span className="text-neutral-400">Live with Faith.</span>
            </h1>
            <p className="text-xl text-neutral-300 mb-8 max-w-lg">
              Welcome to Lord's Gym Auburn. A community dedicated to building strength inside and out. Join us in our mission of restoration and discipline.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="primary" className="bg-white !text-black hover:bg-neutral-200" onClick={() => onNavigate('/membership')}>
                Start Your Free Visit
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => onNavigate('/shop')}>
                Shop Merch
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <Section id="programs">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Programs</h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Whether you're training for competition, recovering from injury, or seeking a supportive community, we have a place for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROGRAMS.map((program) => (
            <Card key={program.id} hoverEffect className="group overflow-hidden p-0 border-l-0">
               <div className="h-48 overflow-hidden relative">
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                 <img src={program.image} alt={program.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale" />
               </div>
               <div className="p-6">
                 <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                 <p className="text-neutral-500 mb-4">{program.description}</p>
                 <Button variant="outline" size="sm" onClick={() => onNavigate('/programs')}>Learn More</Button>
               </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Mindbody Schedule Preview */}
      <Section bg="alternate">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Upcoming Classes</h2>
            <p className="mb-6 text-neutral-500">
              Join our group sessions designed to push your limits in a supportive environment. Drop-ins welcome.
            </p>
            <div className="space-y-4">
              {UPCOMING_CLASSES.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm">
                   <div>
                     <div className="font-bold text-lg">{cls.time}</div>
                     <div className="text-sm font-semibold text-black dark:text-white">{cls.title}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-sm text-neutral-500">{cls.instructor}</div>
                     <div className="text-xs text-neutral-400">{cls.duration}</div>
                   </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button onClick={() => onNavigate('/programs')}>View Full Schedule</Button>
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute -inset-4 bg-black/10 dark:bg-white/10 rounded-xl blur-lg"></div>
             <img 
               src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80" 
               alt="Group Class" 
               className="relative rounded-xl shadow-2xl grayscale"
             />
             <div className="absolute bottom-8 left-8 right-8 bg-white/95 dark:bg-neutral-900/95 backdrop-blur p-6 rounded-lg border-l-4 border-black dark:border-white">
               <p className="italic font-medium text-lg">"Iron sharpens iron, and one man sharpens another."</p>
               <p className="text-xs font-bold mt-2 uppercase text-neutral-500">Proverbs 27:17</p>
             </div>
          </div>
        </div>
      </Section>

      {/* Outreach Spotlight */}
      <Section bg="dark" className="text-center">
        <h2 className="text-4xl font-bold mb-6">Stronger Community</h2>
        <p className="max-w-3xl mx-auto text-xl text-neutral-300 mb-12">
          Lord's Gym isn't just a gym. We are a ministry. A portion of every membership goes directly to feeding the hungry and supporting youth mentorship in Auburn.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
           <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
             <div className="text-white text-4xl mb-4">🍞</div>
             <h3 className="font-bold text-xl mb-2 text-white">Food Distribution</h3>
             <p className="text-neutral-400">Serving 500+ families weekly with fresh groceries and hot meals.</p>
           </div>
           <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
             <div className="text-white text-4xl mb-4">🤝</div>
             <h3 className="font-bold text-xl mb-2 text-white">Youth Outreach</h3>
             <p className="text-neutral-400">Providing discipline, safety, and mentorship for at-risk teens.</p>
           </div>
           <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
             <div className="text-white text-4xl mb-4">🙏</div>
             <h3 className="font-bold text-xl mb-2 text-white">Recovery Support</h3>
             <p className="text-neutral-400">Fitness as a tool for sobriety and mental health restoration.</p>
           </div>
        </div>
        <div className="mt-12">
           <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => onNavigate('/community')}>See Our Impact</Button>
        </div>
      </Section>

      {/* Merch Spotlight (Shopify) */}
      <Section id="shop-preview">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Faith & Fitness Apparel</h2>
            <p className="text-neutral-500">Wear your testimony. Christian-based t-shirts designed for the gym and the streets.</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate('/shop')}>View All Products &rarr;</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_PRODUCTS.map((product) => (
            <ShopifyProduct key={product.id} product={product} />
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <Section bg="image" bgImage="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80" className="text-center py-32">
        <h2 className="text-5xl font-bold mb-6 text-white">Ready to Train With Purpose?</h2>
        <p className="text-xl text-neutral-200 mb-8">Join a community that fights for you, not against you.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <Button size="lg" className="bg-white !text-black hover:bg-neutral-200" onClick={() => onNavigate('/membership')}>Join Now</Button>
           <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => onNavigate('/contact')}>Book a Tour</Button>
        </div>
      </Section>
    </>
  );
};

export default Home;