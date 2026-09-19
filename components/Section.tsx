import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: 'default' | 'alternate' | 'dark' | 'image';
  bgImage?: string;
  /** When bg="image", use e.g. "center top" to show upper part of photo (avoid cutting off heads) */
  bgImagePosition?: string;
  /** Mark above-the-fold hero imagery as eager; defer decorative sections below the fold. */
  bgImageLoading?: 'eager' | 'lazy';
  bgImageFetchPriority?: 'high' | 'low' | 'auto';
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  className = '', 
  id,
  bg = 'default',
  bgImage,
  bgImagePosition = 'center center',
  bgImageLoading = 'eager',
  bgImageFetchPriority = 'auto',
}) => {
  const bgStyles = {
    default: "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-white",
    alternate: "bg-white dark:bg-neutral-900 text-brand-charcoal dark:text-white",
    dark: "bg-brand-charcoal text-white",
    image: "relative text-white overflow-hidden"
  };

  return (
    <section 
      id={id} 
      className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${bgStyles[bg]} ${className}`}
    >
      {bg === 'image' && bgImage && (
        <>
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            loading={bgImageLoading}
            fetchPriority={bgImageFetchPriority}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover grayscale pointer-events-none z-0"
            style={{ objectPosition: bgImagePosition }}
          />
          <div className="absolute inset-0 bg-black/70 pointer-events-none z-0" />
        </>
      )}
      <div className={`max-w-7xl mx-auto relative z-10`}>
        {children}
      </div>
    </section>
  );
};

export default Section;
