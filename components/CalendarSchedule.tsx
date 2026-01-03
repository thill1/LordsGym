
import React, { useState } from 'react';

type ClassType = 'strength' | 'cardio' | 'recovery' | 'community';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  instructor: string;
  type: ClassType;
}

const CLASS_STYLES: Record<ClassType, string> = {
  strength: 'bg-red-100 text-red-800 border-l-4 border-red-500 dark:bg-red-900/20 dark:text-red-200',
  cardio: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:text-blue-200',
  recovery: 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-200',
  community: 'bg-amber-100 text-amber-800 border-l-4 border-amber-500 dark:bg-amber-900/20 dark:text-amber-200',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate Schedule Data
const generateSchedule = () => {
  const events: Record<number, CalendarEvent[]> = {};
  
  // Logic to simulate a monthly schedule
  for (let day = 1; day <= 31; day++) {
    // Offset day of week calculation (assuming Jan 2025 starts on Wed)
    const dayOfWeek = (day + 2) % 7; 
    
    const dailyEvents: CalendarEvent[] = [];
    const datePrefix = `evt-${day}`;

    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) { // Mon, Wed, Fri
      dailyEvents.push({ id: `${datePrefix}-1`, title: 'Morning Grind', time: '6:00 AM', instructor: 'Mark D.', type: 'strength' });
      dailyEvents.push({ id: `${datePrefix}-2`, title: 'Lunch Lift', time: '12:00 PM', instructor: 'Sarah J.', type: 'strength' });
      dailyEvents.push({ id: `${datePrefix}-3`, title: 'Power Hour', time: '5:30 PM', instructor: 'Mark D.', type: 'strength' });
    } else if (dayOfWeek === 2 || dayOfWeek === 4) { // Tue, Thu
      dailyEvents.push({ id: `${datePrefix}-1`, title: 'Metcon', time: '6:00 AM', instructor: 'Mike T.', type: 'cardio' });
      dailyEvents.push({ id: `${datePrefix}-2`, title: 'Functional Fit', time: '5:30 PM', instructor: 'Mike T.', type: 'cardio' });
      dailyEvents.push({ id: `${datePrefix}-3`, title: 'Mobility Flow', time: '7:00 PM', instructor: 'Guest', type: 'recovery' });
    } else if (dayOfWeek === 6) { // Sat
      dailyEvents.push({ id: `${datePrefix}-1`, title: 'Community WOD', time: '9:00 AM', instructor: 'Team', type: 'community' });
    }
    
    if (dailyEvents.length > 0) {
      events[day] = dailyEvents;
    }
  }
  return events;
};

const SCHEDULE = generateSchedule();

const CalendarSchedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Example: Jan 2025 Layout (Starts Wed)
  const emptySlots = [0, 1, 2];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
      
      {/* Calendar Header */}
      <div className="bg-brand-charcoal text-white p-6 flex justify-between items-center">
         <div>
           <h2 className="text-2xl font-display font-bold uppercase tracking-wider">January 2025</h2>
           <p className="text-neutral-400 text-sm">Class Schedule</p>
         </div>
         <div className="flex gap-2">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50" disabled>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
         </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-neutral-200 dark:bg-neutral-700 gap-px border-b border-neutral-200 dark:border-neutral-700">
        
        {/* Empty Slots */}
        {emptySlots.map(slot => (
           <div key={`empty-${slot}`} className="bg-neutral-50 dark:bg-neutral-900/50 min-h-[120px]"></div>
        ))}

        {/* Days */}
        {daysInMonth.map(day => {
          const events = SCHEDULE[day] || [];
          const isToday = day === 6; // Just for visual demo
          
          return (
            <div 
              key={day} 
              className={`bg-white dark:bg-neutral-800 min-h-[120px] p-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer group relative ${selectedDay === day ? 'ring-2 ring-inset ring-brand-red' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="flex justify-between items-start mb-2">
                 <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-red text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                   {day}
                 </span>
                 {events.length > 0 && (
                   <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline-block">{events.length} classes</span>
                 )}
              </div>
              
              <div className="space-y-1">
                {events.slice(0, 3).map(event => (
                  <div key={event.id} className={`text-[10px] px-1.5 py-1 rounded truncate border-l-2 ${CLASS_STYLES[event.type]} bg-opacity-50`}>
                    <span className="font-bold mr-1">{event.time.split(' ')[0]}</span>
                    {event.title}
                  </div>
                ))}
                {events.length > 3 && (
                   <div className="text-[10px] text-neutral-400 pl-1 italic">
                     + {events.length - 3} more
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
         <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-brand-red">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            {selectedDay ? `Schedule for Jan ${selectedDay}` : 'Select a date to view details'}
         </h3>
         
         {selectedDay && (
           <div className="space-y-3">
             {SCHEDULE[selectedDay] ? (
               SCHEDULE[selectedDay].map(event => (
                 <div key={event.id} className={`flex items-center p-3 rounded-lg border ${CLASS_STYLES[event.type].replace('border-l-4', 'border-l-4')}`}>
                    <div className="min-w-[80px] font-bold text-lg">{event.time}</div>
                    <div className="flex-grow">
                       <h4 className="font-bold uppercase tracking-wide text-sm">{event.title}</h4>
                       <p className="text-xs opacity-80">Instructor: {event.instructor}</p>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-60 px-2 py-1 border border-current rounded">
                       {event.type}
                    </div>
                 </div>
               ))
             ) : (
               <p className="text-neutral-500 italic">No classes scheduled for this day.</p>
             )}
           </div>
         )}
         {!selectedDay && <p className="text-neutral-500 text-sm">Click on any day in the calendar above to see the full class listing.</p>}
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-neutral-800 p-4 flex flex-wrap gap-4 text-xs border-t border-neutral-200 dark:border-neutral-700">
         <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Strength</div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Cardio/HIIT</div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Recovery</div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-sm"></span> Community</div>
      </div>
    </div>
  );
};

export default CalendarSchedule;
