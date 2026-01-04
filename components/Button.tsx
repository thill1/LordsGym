
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'brand', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";
  
  const variants = {
    // Brand: Neutral by default, Red accent only on hover
    brand: "bg-neutral-900 text-white border border-neutral-700 hover:bg-brand-red hover:border-brand-red hover:text-white shadow-lg",
    
    // Primary: White on Black / Black on White
    primary: "bg-brand-charcoal text-white hover:bg-black dark:bg-white dark:text-brand-charcoal dark:hover:bg-neutral-200 shadow-md",
    
    // Secondary: Gray background
    secondary: "bg-neutral-200 text-brand-charcoal hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
    
    // Outline: Border only
    outline: "border-2 border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-brand-charcoal",
    
    // Ghost: Text only
    ghost: "bg-transparent text-current hover:bg-neutral-100 dark:hover:bg-neutral-800"
  };

  const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-base px-8 py-4"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
