import React from 'react';
import Section from '../components/Section';
import MindbodyWidget from '../components/MindbodyWidget';
import { PROGRAMS } from '../constants';

const Programs: React.FC = () => {
  return (
    <>
      <Section bg="dark" className="pt-32 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Training Programs</h1>
        <p className="text-xl text-neutral-300">Specific goals require specific training.</p>
      </Section>

      <Section>
         <div className="grid grid-cols-1 gap-12">
            {PROGRAMS.map((prog, idx) => (
              <div key={prog.id} className={`flex flex-col md:flex-row gap-8 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                 <div className="w-full md:w-1/3">
                    <img src={prog.image} alt={prog.title} className="w-full h-64 object-cover rounded-lg shadow-md" />
                 </div>
                 <div className="w-full md:w-2/3">
                    <h3 className="text-2xl font-bold mb-2">{prog.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">{prog.description}</p>
                    <ul className="list-disc list-inside text-neutral-500 mb-4 space-y-1">
                      <li>Professional Coaching</li>
                      <li>Small Group Atmosphere</li>
                      <li>Progress Tracking</li>
                    </ul>
                 </div>
              </div>
            ))}
         </div>
      </Section>

      <Section bg="alternate" id="schedule">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Class Schedule</h2>
            <p className="text-neutral-500">Book your spot in advance. Drop-ins welcome if space permits.</p>
          </div>
          <MindbodyWidget title="Weekly Schedule" type="schedule" />
        </div>
      </Section>
    </>
  );
};

export default Programs;