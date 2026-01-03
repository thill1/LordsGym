import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false }) => {
  const hoverClasses = hoverEffect 
    ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer" 
    : "";

  return (
    <div className={`bg-white dark:bg-neutral-800 border-l-4 border-brand-red shadow-md p-6 ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;