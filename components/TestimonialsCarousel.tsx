import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../types';
import Card from './Card';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoScrollInterval?: number; // milliseconds
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ 
  testimonials, 
  autoScrollInterval = 5000 
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef<number>(0.5); // pixels per frame for smooth scroll (adjust for speed - higher = faster)

  // Determine items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      let newItemsPerView = 1;
      if (window.innerWidth >= 1024) {
        newItemsPerView = 3;
      } else if (window.innerWidth >= 768) {
        newItemsPerView = 2;
      }
      setItemsPerView(newItemsPerView);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [testimonials.length]);

  // Smooth continuous scroll animation using requestAnimationFrame
  useEffect(() => {
    if (!testimonials || testimonials.length === 0 || testimonials.length <= 1) {
      return;
    }

    if (isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      if (!isPaused && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth > 0) {
          const itemWidth = containerWidth / itemsPerView;
          const totalWidth = testimonials.length * itemWidth;
          
          setScrollOffset((prev) => {
            let newOffset = prev + scrollSpeedRef.current;
            
            // Seamless loop: reset when we've scrolled past all items
            if (newOffset >= totalWidth) {
              newOffset = 0;
            }
            
            return newOffset;
          });
        }
      }

      if (!isPaused) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [testimonials.length, itemsPerView, isPaused]);

  const handlePrevious = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const itemWidth = containerWidth / itemsPerView;
      setScrollOffset((prev) => {
        const newPos = prev - itemWidth;
        const totalWidth = testimonials.length * itemWidth;
        return newPos < 0 ? totalWidth - itemWidth : newPos;
      });
    }
  };

  const handleNext = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const itemWidth = containerWidth / itemsPerView;
      setScrollOffset((prev) => {
        const newPos = prev + itemWidth;
        const totalWidth = testimonials.length * itemWidth;
        return newPos >= totalWidth ? 0 : newPos;
      });
    }
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const widthPercentage = 100 / itemsPerView;
  
  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden" ref={containerRef}>
        <div 
          className="flex"
          style={{
            transform: `translateX(-${scrollOffset}px)`,
            willChange: 'transform'
          }}
        >
          {duplicatedTestimonials.map((testimonial, idx) => (
            <div 
              key={`${testimonial.id}-${idx}`}
              className="flex-shrink-0 px-4"
              style={{ width: `${widthPercentage}%` }}
            >
              <Card className="bg-neutral-800 border-neutral-700 h-full">
                <div className="p-6 h-full flex flex-col">
                  <div className="mb-4 flex-grow">
                    <p className="text-neutral-200 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                  </div>
                  <div className="border-t border-neutral-700 pt-4 mt-auto">
                    <div className="font-bold text-white text-lg">{testimonial.name}</div>
                    <div className="text-sm text-neutral-400">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {testimonials.length > itemsPerView && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-brand-red text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors z-10 hidden md:flex items-center justify-center w-10 h-10"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-brand-red text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors z-10 hidden md:flex items-center justify-center w-10 h-10"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default TestimonialsCarousel;
