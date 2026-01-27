import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: 'default' | 'alternate' | 'dark' | 'image';
  bgImage?: string;
  /** When bg="image", use e.g. "center top" to show upper part of photo (avoid cutting off heads) */
  bgImagePosition?: string;
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  className = '', 
  id,
  bg = 'default',
  bgImage,
  bgImagePosition = 'center center'
}) => {
  const bgStyles = {
    default: "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-white",
    alternate: "bg-white dark:bg-neutral-900 text-brand-charcoal dark:text-white",
    dark: "bg-brand-charcoal text-white",
    image: "relative text-white overflow-hidden"
  };

  const bgImageStyle = bg === 'image' && bgImage
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: bgImagePosition,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        filter: 'grayscale(100%)'
      }
    : {};

  return (
    <section 
      id={id} 
      className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${bgStyles[bg]} ${className}`}
    >
      {bg === 'image' && bgImage && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={bgImageStyle}
            aria-hidden
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