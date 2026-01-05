/**
 * ARCHIVED: Training Programs Section for Home Page
 * 
 * This component was removed from the home page but archived in case it needs to be restored.
 * 
 * To restore:
 * 1. Import this component in pages/Home.tsx
 * 2. Add it back to the Home component JSX
 * 3. Remove this archived file
 */

import React from 'react';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Program } from '../../types';

interface ProgramsSectionProps {
  programs: Program[];
  onNavigate: (path: string) => void;
}

export const HomeProgramsSection: React.FC<ProgramsSectionProps> = ({ programs, onNavigate }) => {
  return (
    <Section bg="alternate">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Training Programs</h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-300">
          Choose the path that fits your goals
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {programs.map((program) => (
          <Card key={program.id} className="overflow-hidden">
            <img 
              src={program.image} 
              alt={program.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{program.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                {program.description}
              </p>
              <Button 
                variant="outline" 
                onClick={() => onNavigate('/programs')}
                className="w-full"
              >
                Learn More
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};
