
import React from 'react';
import { MINDBODY_SITE_ID } from '../constants';
import Button from './Button';

interface MindbodyWidgetProps {
  title: string;
  type?: 'schedule' | 'enrollment' | 'appointment';
  className?: string;
}

const MindbodyWidget: React.FC<MindbodyWidgetProps> = ({ title, type = 'schedule', className = '' }) => {
  return (
    <div className={`w-full bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold uppercase tracking-wider text-brand-charcoal dark:text-white">{title}</h3>
         <div className="text-[10px] font-bold uppercase bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded text-neutral-500">
            Powered by MindBody
         </div>
      </div>
      
      <div className="bg-neutral-50 dark:bg-neutral-900 min-h-[300px] flex flex-col items-center justify-center rounded border border-neutral-200 dark:border-neutral-700 text-center p-8 overflow-hidden relative">
        <div className="mb-6 relative z-10">
          {type === 'schedule' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 dark:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          )}
          {type === 'enrollment' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 dark:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          )}
          {type === 'appointment' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 dark:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          )}
        </div>
        
        <h4 className="font-bold text-lg text-brand-charcoal dark:text-white mb-2 z-10">Online Booking Portal</h4>
        <p className="text-sm text-neutral-500 max-w-xs mx-auto mb-8 z-10">
          Please launch the secure booking portal to view live availability and book your session.
        </p>
        
        <Button variant="outline" className="z-10 bg-white dark:bg-transparent">Launch Booking System</Button>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-50 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/4 w-32 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full transform -rotate-45"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 border-4 border-neutral-100 dark:border-neutral-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MindbodyWidget;
