// iCal export utility for calendar events

export interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  url?: string;
  /** RRULE string for recurring events (e.g. "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE") */
  rrule?: string;
  /** End date for recurring series (UTC) */
  until?: Date;
}

/**
 * Generate iCal format string from events
 */
export const generateICal = (events: ICalEvent[]): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const eventStrings = events.map(event => {
    let ical = `BEGIN:VEVENT\r\n`;
    ical += `UID:${event.uid}\r\n`;
    ical += `DTSTART:${formatDate(event.start)}\r\n`;
    ical += `DTEND:${formatDate(event.end)}\r\n`;
    ical += `SUMMARY:${escapeText(event.summary)}\r\n`;
    
    if (event.description) {
      ical += `DESCRIPTION:${escapeText(event.description)}\r\n`;
    }
    
    if (event.location) {
      ical += `LOCATION:${escapeText(event.location)}\r\n`;
    }
    
    if (event.url) {
      ical += `URL:${event.url}\r\n`;
    }

    if (event.rrule) {
      ical += `RRULE:${event.rrule}\r\n`;
      if (event.until) {
        ical += `UNTIL:${formatDate(event.until)}\r\n`;
      }
    }

    ical += `DTSTAMP:${formatDate(new Date())}\r\n`;
    ical += `END:VEVENT\r\n`;
    
    return ical;
  }).join('');

  return `BEGIN:VCALENDAR\r\n` +
         `VERSION:2.0\r\n` +
         `PRODID:-//Lord's Gym//Calendar//EN\r\n` +
         `CALSCALE:GREGORIAN\r\n` +
         eventStrings +
         `END:VCALENDAR\r\n`;
};

/**
 * Download iCal file
 */
export const downloadICal = (events: ICalEvent[], filename: string = 'lords-gym-calendar.ics'): void => {
  const icalContent = generateICal(events);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
