import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon Mark: Cross + L Motif */}
      <svg
        viewBox="0 0 100 100"
        className="w-10 h-10 text-brand-red fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20,10 L35,10 L35,60 L70,60 L70,75 L20,75 Z" className="text-current" /> {/* L Shape */}
        <rect x="40" y="20" width="15" height="50" className="fill-brand-red" /> {/* Vertical Cross Bar */}
        <rect x="25" y="35" width="45" height="15" className="fill-brand-red" /> {/* Horizontal Cross Bar */}
      </svg>
      
      {variant === 'full' && (
        <div className="flex flex-col leading-none uppercase font-display tracking-widest text-current">
          <span className="text-xl font-bold">Lord's</span>
          <span className="text-sm font-bold opacity-70">Gym</span>
        </div>
      )}
    </div>
  );
};

export default Logo;