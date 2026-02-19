
import React, { useCallback, useState } from 'react';
import Section from '../components/Section';
import CalendarView from '../components/CalendarView';
import CalendarEventModal from '../components/CalendarEventModal';
import { CalendarView as ViewType, getClassTypeDotColor, formatClassType } from '../lib/calendar-utils';
import { downloadICal, ICalEvent } from '../lib/ical-export';
import { useCalendar } from '../context/CalendarContext';

const HERO_IMAGE = `${import.meta.env.BASE_URL || '/'}media/outreach/outreach-community.jpg.jpeg`.replace(/\/\/+/g, '/');

const VIEW_OPTIONS: { value: ViewType; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'list', label: 'List' },
];

const Calendar: React.FC = () => {
  const { events } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportCalendar = () => {
    const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const buildRrule = (pat: { pattern_type: string; interval: number; days_of_week: number[] | null; end_date: string | null }) => {
      const interval = Math.max(1, pat.interval || 1);
      if (pat.pattern_type === 'daily') {
        return { rrule: `FREQ=DAILY;INTERVAL=${interval}`, until: pat.end_date ? new Date(pat.end_date + 'T23:59:59Z') : undefined };
      }
      if (pat.pattern_type === 'weekly') {
        const days = (pat.days_of_week || []).map(d => (d === 7 ? 0 : d)).filter(d => d >= 0 && d <= 6);
        const byday = days.length ? `;BYDAY=${days.map(d => DAY_CODES[d]).join(',')}` : '';
        return { rrule: `FREQ=WEEKLY;INTERVAL=${interval}${byday}`, until: pat.end_date ? new Date(pat.end_date + 'T23:59:59Z') : undefined };
      }
      if (pat.pattern_type === 'monthly') {
        return { rrule: `FREQ=MONTHLY;INTERVAL=${interval}`, until: pat.end_date ? new Date(pat.end_date + 'T23:59:59Z') : undefined };
      }
      return {};
    };
    const icalEvents: ICalEvent[] = events.map(event => {
      const base: ICalEvent = {
        uid: `lords-gym-${event.id}@lordsgym.com`,
        summary: event.title,
        description: event.description || undefined,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        url: `${window.location.origin}/calendar`
      };
      if (event.recurring_pattern) {
        const { rrule, until } = buildRrule(event.recurring_pattern);
        if (rrule) base.rrule = rrule;
        if (until) base.until = until;
      }
      return base;
    });
    downloadICal(icalEvents, 'lords-gym-calendar.ics');
  };

  const navigate = useCallback((direction: -1 | 0 | 1) => {
    if (direction === 0) {
      setCurrentDate(new Date());
      return;
    }
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + direction);
    else if (view === 'week') d.setDate(d.getDate() + direction * 7);
    else d.setDate(d.getDate() + direction);
    setCurrentDate(d);
  }, [currentDate, view]);

  return (
    <>
      <Section bg="image" bgImage={HERO_IMAGE} bgImagePosition="center top" className="min-h-[55vh] flex items-center justify-center text-center pt-32 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto px-4 fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg font-display">Lord's Gym <span className="text-brand-red">Calendar</span></h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
            View our Community, Outreach, and Holiday events.
          </p>
        </div>
      </Section>

      <Section>
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Row 1: View toggle (left) + Nav (right) */}
          <div className="bg-white dark:bg-neutral-800 px-3 py-3 sm:px-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Segmented view toggle */}
              <div className="inline-flex rounded-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden" role="tablist" aria-label="Calendar view">
                {VIEW_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    role="tab"
                    aria-selected={view === opt.value}
                    onClick={() => setView(opt.value)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors ${
                      view === opt.value
                        ? 'bg-brand-red text-white'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              {view !== 'list' && (
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(-1)}
                    aria-label="Previous"
                    className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => navigate(0)}
                    className="px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    aria-label="Next"
                    className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <input
                    type="date"
                    value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) setCurrentDate(new Date(v));
                    }}
                    aria-label="Jump to date"
                    className="px-2 py-1.5 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
              )}
            </div>

            {/* Row 2: Search + Export */}
            <div className="flex items-center gap-3 mt-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Search events..."
                  aria-label="Search events"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" aria-label="Clear search">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              <button
                onClick={handleExportCalendar}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>

            {/* Row 3: Event type legend (collapsible on mobile via overflow-x) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 text-[10px] sm:text-xs" role="list" aria-label="Event type legend">
              {['community', 'outreach', 'fundraisers', 'self_help', 'holiday'].map((type) => (
                <div key={type} className="flex items-center gap-1.5" role="listitem">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getClassTypeDotColor(type)}`} aria-hidden />
                  <span className="text-neutral-500 dark:text-neutral-400">{formatClassType(type)}</span>
                </div>
              ))}
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

      {selectedEventId && (
        <CalendarEventModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onBook={() => setSelectedEventId(null)}
        />
      )}
    </>
  );
};

export default Calendar;
