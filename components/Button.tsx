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
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    // Brand: High Contrast Red
    brand: "bg-brand-red text-white hover:bg-brand-redHover focus:ring-brand-red",
    
    // Primary: Black on White (Light Mode) / White on Black (Dark Mode)
    primary: "bg-brand-charcoal text-white hover:bg-black dark:bg-white dark:text-brand-charcoal dark:hover:bg-neutral-200 focus:ring-neutral-500",
    
    // Secondary: Gray background
    secondary: "bg-neutral-200 text-brand-charcoal hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 focus:ring-neutral-500",
    
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