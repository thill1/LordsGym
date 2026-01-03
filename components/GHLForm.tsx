import React, { useEffect, useRef } from 'react';
import { GHL_FORM_ID } from '../constants';

interface GHLFormProps {
  className?: string;
}

const GHLForm: React.FC<GHLFormProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real scenario, you would inject the GHL Form script here
    // Example: 
    // const script = document.createElement('script');
    // script.src = `https://link.msgsndr.com/js/form_embed.js?id=${GHL_FORM_ID}`;
    // containerRef.current?.appendChild(script);
    
    console.log(`GHL Form ${GHL_FORM_ID} logic mounted`);
  }, []);

  return (
    <div ref={containerRef} className={`bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl border-t-4 border-black dark:border-white ${className}`}>
      <h3 className="text-2xl font-bold mb-6 uppercase tracking-wider">Send a Message</h3>
      
      {/* Fallback/Placeholder UI while script loads */}
      <div className="space-y-4">
        <div className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 animate-pulse"></div>
        <div className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 animate-pulse"></div>
        <div className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 animate-pulse"></div>
        <div className="h-12 bg-black dark:bg-white rounded"></div>
      </div>
      
      <p className="text-[10px] text-neutral-400 mt-4 text-center uppercase">
        Integrated via Go High Level
      </p>
    </div>
  );
};

export default GHLForm;