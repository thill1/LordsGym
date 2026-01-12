// US Holidays utility - automatically generates US federal holidays

export interface Holiday {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  class_type: 'holiday';
  capacity: null;
  instructor_id: null;
}

/**
 * Calculate Easter Sunday for a given year
 */
function getEasterSunday(year: number): Date {
  // Anonymous Gregorian algorithm
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Get the nth occurrence of a weekday in a month
 */
function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  let day = 1 + ((weekday - firstWeekday + 7) % 7);
  if (n > 1) {
    day += (n - 1) * 7;
  }
  return new Date(year, month, day);
}

/**
 * Get the last occurrence of a weekday in a month
 */
function getLastWeekday(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();
  let day = lastDay.getDate() - ((lastWeekday - weekday + 7) % 7);
  return new Date(year, month, day);
}

/**
 * Generate US federal holidays for a given year
 */
export function generateUSHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // New Year's Day - January 1
  const newYears = new Date(year, 0, 1);
  holidays.push({
    id: `holiday-${year}-new-years`,
    title: "New Year's Day",
    description: 'US Federal Holiday',
    start_time: new Date(year, 0, 1, 0, 0).toISOString(),
    end_time: new Date(year, 0, 1, 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Martin Luther King Jr. Day - Third Monday in January
  const mlkDay = getNthWeekday(year, 0, 1, 3);
  holidays.push({
    id: `holiday-${year}-mlk`,
    title: "Martin Luther King Jr. Day",
    description: 'US Federal Holiday',
    start_time: new Date(mlkDay.getFullYear(), mlkDay.getMonth(), mlkDay.getDate(), 0, 0).toISOString(),
    end_time: new Date(mlkDay.getFullYear(), mlkDay.getMonth(), mlkDay.getDate(), 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Presidents' Day - Third Monday in February
  const presidentsDay = getNthWeekday(year, 1, 1, 3);
  holidays.push({
    id: `holiday-${year}-presidents`,
    title: "Presidents' Day",
    description: 'US Federal Holiday',
    start_time: new Date(presidentsDay.getFullYear(), presidentsDay.getMonth(), presidentsDay.getDate(), 0, 0).toISOString(),
    end_time: new Date(presidentsDay.getFullYear(), presidentsDay.getMonth(), presidentsDay.getDate(), 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Memorial Day - Last Monday in May
  const memorialDay = getLastWeekday(year, 4, 1);
  holidays.push({
    id: `holiday-${year}-memorial`,
    title: 'Memorial Day',
    description: 'US Federal Holiday',
    start_time: new Date(memorialDay.getFullYear(), memorialDay.getMonth(), memorialDay.getDate(), 0, 0).toISOString(),
    end_time: new Date(memorialDay.getFullYear(), memorialDay.getMonth(), memorialDay.getDate(), 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Juneteenth - June 19
  holidays.push({
    id: `holiday-${year}-juneteenth`,
    title: 'Juneteenth',
    description: 'US Federal Holiday',
    start_time: new Date(year, 5, 19, 0, 0).toISOString(),
    end_time: new Date(year, 5, 19, 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Independence Day - July 4
  holidays.push({
    id: `holiday-${year}-independence`,
    title: 'Independence Day',
    description: 'US Federal Holiday',
    start_time: new Date(year, 6, 4, 0, 0).toISOString(),
    end_time: new Date(year, 6, 4, 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Labor Day - First Monday in September
  const laborDay = getNthWeekday(year, 8, 1, 1);
  holidays.push({
    id: `holiday-${year}-labor`,
    title: 'Labor Day',
    description: 'US Federal Holiday',
    start_time: new Date(laborDay.getFullYear(), laborDay.getMonth(), laborDay.getDate(), 0, 0).toISOString(),
    end_time: new Date(laborDay.getFullYear(), laborDay.getMonth(), laborDay.getDate(), 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Columbus Day - Second Monday in October
  const columbusDay = getNthWeekday(year, 9, 1, 2);
  holidays.push({
    id: `holiday-${year}-columbus`,
    title: 'Columbus Day',
    description: 'US Federal Holiday',
    start_time: new Date(columbusDay.getFullYear(), columbusDay.getMonth(), columbusDay.getDate(), 0, 0).toISOString(),
    end_time: new Date(columbusDay.getFullYear(), columbusDay.getMonth(), columbusDay.getDate(), 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Veterans Day - November 11
  holidays.push({
    id: `holiday-${year}-veterans`,
    title: "Veterans Day",
    description: 'US Federal Holiday',
    start_time: new Date(year, 10, 11, 0, 0).toISOString(),
    end_time: new Date(year, 10, 11, 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Thanksgiving - Fourth Thursday in November
  const thanksgiving = getNthWeekday(year, 10, 4, 4);
  holidays.push({
    id: `holiday-${year}-thanksgiving`,
    title: 'Thanksgiving',
    description: 'US Federal Holiday',
    start_time: new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate(), 0, 0).toISOString(),
    end_time: new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate(), 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  // Christmas - December 25
  holidays.push({
    id: `holiday-${year}-christmas`,
    title: 'Christmas',
    description: 'US Federal Holiday',
    start_time: new Date(year, 11, 25, 0, 0).toISOString(),
    end_time: new Date(year, 11, 25, 23, 59).toISOString(),
    class_type: 'holiday',
    capacity: null,
    instructor_id: null
  });

  return holidays;
}

/**
 * Get holidays for a date range (current year and next year)
 */
export function getHolidaysForRange(startYear: number, endYear: number): Holiday[] {
  const holidays: Holiday[] = [];
  for (let year = startYear; year <= endYear; year++) {
    holidays.push(...generateUSHolidays(year));
  }
  return holidays;
}
