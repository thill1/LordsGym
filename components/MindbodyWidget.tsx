import React from 'react';
import { MINDBODY_SITE_ID } from '../constants';

const MindbodyWidget: React.FC<{ title: string, type?: 'schedule' | 'enrollment' }> = ({ title, type = 'schedule' }) => {
  return (
    <div className="w-full bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      
      {/* 
        INTEGRATION NOTE: 
        Replace the code block below with the actual Mindbody branded web widget script.
        Documentation: https://support.mindbodyonline.com/s/article/Branded-web-tools-widgets?language=en_US
        
        Example:
        <script src="https://widgets.mindbodyonline.com/javascripts/healcode.js" type="text/javascript"></script>
        <healcode-widget data-type="schedules" data-widget-partner="object" data-widget-id="..." data-widget-version="1" ></healcode-widget>
      */}
      
      <div className="bg-neutral-100 dark:bg-neutral-900 h-64 flex flex-col items-center justify-center rounded border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-gold mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="font-bold text-neutral-500">Mindbody {type === 'schedule' ? 'Class Schedule' : 'Enrollment'} Widget</p>
        <p className="text-xs text-neutral-400 mt-2">Connecting to Site ID: {MINDBODY_SITE_ID}...</p>
        <p className="text-xs text-brand-gold mt-4 font-mono bg-black/10 px-2 py-1 rounded">
          Placeholder Mode active
        </p>
      </div>
    </div>
  );
};

export default MindbodyWidget;