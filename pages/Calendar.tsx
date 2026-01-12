
import React, { useState } from 'react';
import Section from '../components/Section';
import CalendarView from '../components/CalendarView';
import CalendarEventModal from '../components/CalendarEventModal';
import BookingHistory from '../components/BookingHistory';
import Button from '../components/Button';
import { CalendarView as ViewType } from '../lib/calendar-utils';
import { downloadICal, ICalEvent } from '../lib/ical-export';
import { useCalendar } from '../context/CalendarContext';
import { useAuth } from '../context/AuthContext';

const Calendar: React.FC = () => {
  const { events } = useCalendar();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterClassType, setFilterClassType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingHistory, setShowBookingHistory] = useState(false);

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
      <Section bg="dark" className="pt-32 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Lord's Gym <span className="text-brand-red">Calendar</span></h1>
        <p className="text-lg md:text-xl text-neutral-300 px-4">
          View our schedule and book your spot.
        </p>
      </Section>

      <Section>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* View Controls & Filters */}
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
                {user && (
                  <Button
                    variant={showBookingHistory ? 'brand' : 'outline'}
                    size="sm"
                    onClick={() => setShowBookingHistory(!showBookingHistory)}
                  >
                    My Bookings
                  </Button>
                )}
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
              <select
                value={filterClassType}
                onChange={(e) => setFilterClassType(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio/HIIT</option>
                <option value="recovery">Recovery</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>

          {/* Booking History or Calendar View */}
          {showBookingHistory ? (
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <BookingHistory />
            </div>
          ) : (
            <CalendarView
              view={view}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEventClick={setSelectedEventId}
              filterClassType={filterClassType}
              searchQuery={searchQuery}
            />
          )}
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
