/**
 * ARCHIVED: Testimonials Section for Home Page
 * 
 * This component was removed from the home page but archived in case it needs to be restored.
 * 
 * To restore:
 * 1. Import this component in pages/Home.tsx
 * 2. Add it back to the Home component JSX
 * 3. Remove this archived file
 */

import React from 'react';
import Section from '../../components/Section';
import Card from '../../components/Card';
import { Testimonial } from '../../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const HomeTestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <Section bg="dark">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">What Our Community Says</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-neutral-800 border-neutral-700">
            <div className="p-6">
              <p className="text-neutral-200 italic mb-4">"{testimonial.quote}"</p>
              <div className="border-t border-neutral-700 pt-4">
                <div className="font-bold text-white">{testimonial.name}</div>
                <div className="text-sm text-neutral-400">{testimonial.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};
