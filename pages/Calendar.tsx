
import React from 'react';
import Section from '../components/Section';
import CalendarSchedule from '../components/CalendarSchedule';

const Calendar: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="pt-32 pb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Lord's Gym <span className="text-brand-red">Calendar</span></h1>
        <p className="text-xl text-neutral-300">
          View our schedule and book your spot.
        </p>
      </Section>

      <Section>
        <div className="max-w-6xl mx-auto">
             <CalendarSchedule />
        </div>
      </Section>
    </>
  );
};

export default Calendar;
