import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: 'default' | 'alternate' | 'dark' | 'image';
  bgImage?: string;
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  className = '', 
  id,
  bg = 'default',
  bgImage
}) => {
  const bgStyles = {
    default: "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-white",
    alternate: "bg-white dark:bg-neutral-900 text-brand-charcoal dark:text-white",
    dark: "bg-brand-charcoal text-white",
    image: "relative bg-cover bg-center bg-no-repeat text-white"
  };

  const style = bg === 'image' && bgImage ? { backgroundImage: `url(${bgImage})` } : {};

  return (
    <section 
      id={id} 
      className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${bgStyles[bg]} ${className}`}
      style={style}
    >
      {bg === 'image' && (
        <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>
      )}
      <div className={`max-w-7xl mx-auto relative z-10`}>
        {children}
      </div>
    </section>
  );
};

export default Section;