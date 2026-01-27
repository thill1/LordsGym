
import React, { useState } from 'react';
import Section from '../components/Section';
import CalendarView from '../components/CalendarView';
import CalendarEventModal from '../components/CalendarEventModal';
import Button from '../components/Button';
import { CalendarView as ViewType } from '../lib/calendar-utils';
import { downloadICal, ICalEvent } from '../lib/ical-export';
import { useCalendar } from '../context/CalendarContext';

const HERO_IMAGE = `${import.meta.env.BASE_URL || '/'}media/outreach/outreach-community.jpg.jpeg`.replace(/\/\/+/g, '/');

const Calendar: React.FC = () => {
  const { events } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportCalendar = () => {
    const icalEvents: ICalEvent[] = events.map(event => ({
      uid: `lords-gym-${event.id}@lordsgym.com`,
      summary: event.title,
      description: event.description || undefined,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      url: `${window.location.origin}/calendar`
    }));

    downloadICal(icalEvents, 'lords-gym-calendar.ics');
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      <Section bg="image" bgImage={HERO_IMAGE} bgImagePosition="center top" className="min-h-[55vh] flex items-center justify-center text-center pt-32 pb-12">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">Lord's Gym <span className="text-brand-red">Calendar</span></h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
            View our Community, Outreach, and Holiday events.
          </p>
        </div>
      </Section>

      <Section>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* View Controls */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={view === 'month' ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setView('month')}
                >
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setView('week')}
                >
                  Week
                </Button>
                <Button
                  variant={view === 'day' ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setView('day')}
                >
                  Day
                </Button>
                <Button
                  variant={view === 'list' ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                >
                  List
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCalendar}
                >
                  Export Calendar
                </Button>
              </div>
              {(view === 'month' || view === 'week' || view === 'day') && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    ← Prev
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    Next →
                  </Button>
                </div>
              )}
              {(view === 'week' || view === 'day') && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(newDate.getDate() - (view === 'week' ? 7 : 1));
                    setCurrentDate(newDate);
                  }}>
                    ← Prev
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(newDate.getDate() + (view === 'week' ? 7 : 1));
                    setCurrentDate(newDate);
                  }}>
                    Next →
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Calendar View */}
          <CalendarView
            view={view}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={setSelectedEventId}
            searchQuery={searchQuery}
          />
        </div>
      </Section>

      {/* Event Modal */}
      {selectedEventId && (
        <CalendarEventModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onBook={(eventId) => {
            // Booking is handled by CalendarEventModal component
            setSelectedEventId(null);
          }}
        />
      )}
    </>
  );
};

export default Calendar;
