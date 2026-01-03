
import React from 'react';
import { MINDBODY_SITE_ID } from '../constants';

interface MindbodyWidgetProps {
  title: string;
  type?: 'schedule' | 'enrollment' | 'appointment';
  className?: string;
}

const MindbodyWidget: React.FC<MindbodyWidgetProps> = ({ title, type = 'schedule', className = '' }) => {
  return (
    <div className={`w-full bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <h3 className="text-xl font-bold mb-4 uppercase tracking-wider text-brand-red">{title}</h3>
      
      {/* 
        INTEGRATION NOTE: 
        Replace this with actual Mindbody Branded Web script snippets.
        Typically found in Mindbody -> Tools -> Branded Web Tools.
      */}
      
      <div className="bg-neutral-100 dark:bg-neutral-900 h-[400px] flex flex-col items-center justify-center rounded border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-center p-8 overflow-hidden">
        <div className="mb-4">
          {type === 'schedule' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          )}
          {type === 'enrollment' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          )}
          {type === 'appointment' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          )}
        </div>
        
        <p className="font-bold text-neutral-600 dark:text-neutral-400">MindBody {type.charAt(0).toUpperCase() + type.slice(1)} Widget</p>
        <p className="text-xs text-neutral-400 mt-2">Active Site ID: {MINDBODY_SITE_ID}</p>
        
        <div className="mt-8 space-y-2 w-full max-w-xs">
          <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-full"></div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4 mx-auto"></div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-full"></div>
        </div>
        
        <p className="text-[10px] text-white bg-neutral-800 dark:bg-white dark:text-black mt-8 font-mono px-3 py-1 rounded uppercase tracking-tighter">
          Ready for script injection
        </p>
      </div>
    </div>
  );
};

export default MindbodyWidget;
