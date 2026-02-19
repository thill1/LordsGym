import { supabase, isSupabaseConfigured } from './supabase';

type PatternType = 'daily' | 'weekly' | 'monthly';

export interface RecurringPatternDefinition {
  id: string;
  pattern_type: PatternType;
  interval: number;
  days_of_week: number[] | null;
  end_date: string | null;
  title: string;
  description: string | null;
  class_type: string;
  instructor_id: string | null;
  capacity: number | null;
  starts_on: string;
  start_time_local: string;
  end_time_local: string;
  timezone: string;
  is_active: boolean;
  generation_horizon_days: number;
}

export interface RecurringException {
  id: string;
  recurring_pattern_id: string;
  exception_date: string;
  reason: string | null;
}

interface RecurringTemplateEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  instructor_id: string | null;
  class_type: string;
  capacity: number | null;
}

export interface RecurrenceSyncResult {
  patternId: string;
  generatedCount: number;
  deletedUnbookedCount: number;
  preservedBookedCount: number;
}

const BOOKED_STATUSES = ['confirmed', 'waitlist'];
const DEFAULT_FUTURE_DAYS = 180;
const DEFAULT_PAST_DAYS = 0;

const toDateKey = (date: Date): string => date.toISOString().split('T')[0];

const atUtcMidnight = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addDaysUtc = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const addMonthsUtc = (date: Date, months: number): Date => {
  const next = new Date(date);
  const day = next.getUTCDate();
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + months);
  const maxDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
  next.setUTCDate(Math.min(day, maxDay));
  return next;
};

const parseDateKeyToUtc = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const normalizeTime = (value: string): string => {
  if (!value) return '00:00:00';
  return value.length === 5 ? `${value}:00` : value;
};

const combineDateAndTime = (dateKey: string, timeValue: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes, seconds] = normalizeTime(timeValue).split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
};

const getTimePartFromIso = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const occurrenceDateFromEvent = (event: { occurrence_date: string | null; start_time: string }): string => {
  if (event.occurrence_date) return event.occurrence_date;
  return toDateKey(new Date(event.start_time));
};

const uniqueSortedDays = (days: number[] | null, fallbackDay: number): number[] => {
  const values = days && days.length > 0 ? days : [fallbackDay];
  return [...new Set(values.filter((day) => day >= 0 && day <= 6))].sort((a, b) => a - b);
};

const calculateMonthDifference = (from: Date, to: Date): number => {
  return (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
};

const collectOccurrenceDates = (
  pattern: RecurringPatternDefinition,
  windowStart: Date,
  windowEnd: Date,
  exceptionDates: Set<string>
): string[] => {
  const startsOnDate = parseDateKeyToUtc(pattern.starts_on);
  const effectiveStart = windowStart < startsOnDate ? startsOnDate : windowStart;
  const endDateLimit = pattern.end_date ? atUtcMidnight(new Date(pattern.end_date)) : windowEnd;
  const effectiveEnd = endDateLimit < windowEnd ? endDateLimit : windowEnd;

  if (effectiveStart > effectiveEnd) return [];

  const interval = Math.max(1, pattern.interval || 1);
  const occurrenceDates: string[] = [];

  if (pattern.pattern_type === 'daily') {
    for (let cursor = new Date(effectiveStart); cursor <= effectiveEnd; cursor = addDaysUtc(cursor, 1)) {
      const diffDays = Math.floor((cursor.getTime() - startsOnDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 0 && diffDays % interval === 0) {
        const dateKey = toDateKey(cursor);
        if (!exceptionDates.has(dateKey)) occurrenceDates.push(dateKey);
      }
    }
    return occurrenceDates;
  }

  if (pattern.pattern_type === 'weekly') {
    const allowedDays = uniqueSortedDays(pattern.days_of_week, startsOnDate.getUTCDay());
    for (let cursor = new Date(effectiveStart); cursor <= effectiveEnd; cursor = addDaysUtc(cursor, 1)) {
      if (!allowedDays.includes(cursor.getUTCDay())) continue;
      const diffDays = Math.floor((cursor.getTime() - startsOnDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays < 0) continue;
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks % interval !== 0) continue;

      const dateKey = toDateKey(cursor);
      if (!exceptionDates.has(dateKey)) occurrenceDates.push(dateKey);
    }
    return occurrenceDates;
  }

  const startDay = startsOnDate.getUTCDate();
  for (let cursor = new Date(Date.UTC(effectiveStart.getUTCFullYear(), effectiveStart.getUTCMonth(), 1));
    cursor <= effectiveEnd;
    cursor = addMonthsUtc(cursor, 1)) {
    const monthDiff = calculateMonthDifference(startsOnDate, cursor);
    if (monthDiff < 0 || monthDiff % interval !== 0) continue;

    const maxDayInMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
    const targetDate = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), Math.min(startDay, maxDayInMonth)));
    if (targetDate < effectiveStart || targetDate > effectiveEnd) continue;

    const dateKey = toDateKey(targetDate);
    if (!exceptionDates.has(dateKey)) occurrenceDates.push(dateKey);
  }

  return occurrenceDates;
};

const buildOccurrencePayload = (pattern: RecurringPatternDefinition, occurrenceDate: string) => {
  const start = combineDateAndTime(occurrenceDate, pattern.start_time_local);
  const end = combineDateAndTime(occurrenceDate, pattern.end_time_local);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  return {
    title: pattern.title,
    description: pattern.description,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    instructor_id: pattern.instructor_id,
    class_type: pattern.class_type,
    capacity: pattern.capacity,
    recurring_pattern_id: pattern.id,
    recurring_series_id: pattern.id,
    occurrence_date: occurrenceDate,
    is_recurring_generated: true,
    is_recurring_preserved: false
  };
};

const getFuturePatternEvents = async (patternId: string) => {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('calendar_events')
    .select('id, start_time, occurrence_date, recurring_pattern_id, is_recurring_generated')
    .eq('recurring_pattern_id', patternId)
    .gte('start_time', nowIso);

  if (error) throw error;
  return data ?? [];
};

const getBookedEventIds = async (eventIds: string[]): Promise<Set<string>> => {
  if (eventIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from('calendar_bookings')
    .select('event_id')
    .in('event_id', eventIds)
    .in('status', BOOKED_STATUSES);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.event_id));
};

const fetchPatternWithExceptions = async (patternId: string): Promise<{
  pattern: RecurringPatternDefinition;
  exceptions: RecurringException[];
  templateEvent: RecurringTemplateEvent | null;
}> => {
  const { data: pattern, error: patternError } = await supabase
    .from('calendar_recurring_patterns')
    .select('*')
    .eq('id', patternId)
    .single();

  if (patternError) throw patternError;
  if (!pattern) throw new Error(`Recurring pattern not found: ${patternId}`);

  const { data: exceptions, error: exceptionError } = await supabase
    .from('calendar_recurring_exceptions')
    .select('*')
    .eq('recurring_pattern_id', patternId);

  if (exceptionError) throw exceptionError;

  const { data: templateEvents, error: templateError } = await supabase
    .from('calendar_events')
    .select('id, title, description, start_time, end_time, instructor_id, class_type, capacity, is_recurring_generated')
    .eq('recurring_pattern_id', patternId)
    .order('is_recurring_generated', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(1);

  if (templateError) throw templateError;

  const templateEvent = templateEvents && templateEvents.length > 0
    ? (templateEvents[0] as RecurringTemplateEvent)
    : null;

  return {
    pattern: pattern as RecurringPatternDefinition,
    exceptions: (exceptions ?? []) as RecurringException[],
    templateEvent
  };
};

const buildEffectivePatternDefinition = (
  pattern: RecurringPatternDefinition,
  templateEvent: RecurringTemplateEvent | null
): RecurringPatternDefinition => {
  if (!templateEvent) return pattern;

  return {
    ...pattern,
    title: templateEvent.title || pattern.title || 'Recurring Event',
    description: templateEvent.description ?? pattern.description ?? null,
    class_type: templateEvent.class_type || pattern.class_type || 'community',
    instructor_id: templateEvent.instructor_id ?? pattern.instructor_id ?? null,
    capacity: templateEvent.capacity ?? pattern.capacity ?? null,
    starts_on: toDateKey(new Date(templateEvent.start_time)),
    start_time_local: getTimePartFromIso(templateEvent.start_time),
    end_time_local: getTimePartFromIso(templateEvent.end_time)
  };
};

const getPatternEventsInWindow = async (patternId: string, windowStart: Date, windowEnd: Date) => {
  const windowEndInclusive = new Date(windowEnd);
  windowEndInclusive.setUTCHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('calendar_events')
    .select('id, start_time, occurrence_date, recurring_pattern_id, is_recurring_generated')
    .eq('recurring_pattern_id', patternId)
    .gte('start_time', windowStart.toISOString())
    .lte('start_time', windowEndInclusive.toISOString());

  if (error) throw error;
  return data ?? [];
};

export const syncRecurringPattern = async (
  patternId: string,
  options?: {
    futureDays?: number;
    pastDays?: number;
  }
): Promise<RecurrenceSyncResult> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { pattern, exceptions, templateEvent } = await fetchPatternWithExceptions(patternId);
  const effectivePattern = buildEffectivePatternDefinition(pattern, templateEvent);
  const existingFutureEvents = await getFuturePatternEvents(patternId);
  const existingFutureEventIds = existingFutureEvents.map((event) => event.id);
  const bookedEventIds = await getBookedEventIds(existingFutureEventIds);

  const eventsToPreserve = existingFutureEvents.filter((event) => bookedEventIds.has(event.id));
  const eventsToDelete = existingFutureEvents.filter((event) => !bookedEventIds.has(event.id));

  if (eventsToDelete.length > 0) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .in('id', eventsToDelete.map((event) => event.id));

    if (error) throw error;
  }

  if (eventsToPreserve.length > 0) {
    const { error } = await supabase
      .from('calendar_events')
      .update({
        is_recurring_preserved: true,
        recurring_series_id: patternId
      })
      .in('id', eventsToPreserve.map((event) => event.id));

    if (error) throw error;
  }

  const exceptionDateSet = new Set(exceptions.map((entry) => entry.exception_date));
  const preservedDateSet = new Set(eventsToPreserve.map(occurrenceDateFromEvent));

  const horizonDays = options?.futureDays ?? effectivePattern.generation_horizon_days ?? DEFAULT_FUTURE_DAYS;
  const pastDays = options?.pastDays ?? DEFAULT_PAST_DAYS;
  const now = atUtcMidnight(new Date());
  const windowStart = addDaysUtc(now, -Math.max(0, pastDays));
  const windowEnd = addDaysUtc(now, Math.max(1, horizonDays));
  const existingWindowEvents = await getPatternEventsInWindow(patternId, windowStart, windowEnd);
  const existingWindowDateSet = new Set(existingWindowEvents.map(occurrenceDateFromEvent));

  const shouldGenerate = effectivePattern.is_active;
  const occurrenceDates = shouldGenerate
    ? collectOccurrenceDates(effectivePattern, windowStart, windowEnd, exceptionDateSet)
    : [];

  const newEventPayload = occurrenceDates
    .filter((dateKey) => !preservedDateSet.has(dateKey) && !existingWindowDateSet.has(dateKey))
    .map((dateKey) => buildOccurrencePayload(effectivePattern, dateKey));

  if (newEventPayload.length > 0) {
    const { error } = await supabase
      .from('calendar_events')
      .insert(newEventPayload);

    if (error) throw error;
  }

  const metadataPatch: Record<string, string | number | boolean | null> = {};
  if (pattern.title !== effectivePattern.title) metadataPatch.title = effectivePattern.title;
  if (pattern.description !== effectivePattern.description) metadataPatch.description = effectivePattern.description;
  if (pattern.class_type !== effectivePattern.class_type) metadataPatch.class_type = effectivePattern.class_type;
  if (pattern.instructor_id !== effectivePattern.instructor_id) metadataPatch.instructor_id = effectivePattern.instructor_id;
  if (pattern.capacity !== effectivePattern.capacity) metadataPatch.capacity = effectivePattern.capacity;
  if (pattern.starts_on !== effectivePattern.starts_on) metadataPatch.starts_on = effectivePattern.starts_on;
  if (pattern.start_time_local !== effectivePattern.start_time_local) metadataPatch.start_time_local = effectivePattern.start_time_local;
  if (pattern.end_time_local !== effectivePattern.end_time_local) metadataPatch.end_time_local = effectivePattern.end_time_local;

  const { error: materializeUpdateError } = await supabase
    .from('calendar_recurring_patterns')
    .update({
      ...metadataPatch,
      last_materialized_at: new Date().toISOString()
    })
    .eq('id', patternId);

  if (materializeUpdateError) throw materializeUpdateError;

  return {
    patternId,
    generatedCount: newEventPayload.length,
    deletedUnbookedCount: eventsToDelete.length,
    preservedBookedCount: eventsToPreserve.length
  };
};

export const syncAllRecurringPatterns = async (): Promise<RecurrenceSyncResult[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data: patterns, error } = await supabase
    .from('calendar_recurring_patterns')
    .select('id')
    .eq('is_active', true);

  if (error) throw error;

  const activePatterns = patterns ?? [];
  const results: RecurrenceSyncResult[] = [];

  for (const pattern of activePatterns) {
    const result = await syncRecurringPattern(pattern.id);
    results.push(result);
  }

  return results;
};

export const deleteRecurringPatternSafely = async (patternId: string): Promise<RecurrenceSyncResult> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const existingFutureEvents = await getFuturePatternEvents(patternId);
  const bookedEventIds = await getBookedEventIds(existingFutureEvents.map((event) => event.id));

  const eventsToPreserve = existingFutureEvents.filter((event) => bookedEventIds.has(event.id));
  const eventsToDelete = existingFutureEvents.filter((event) => !bookedEventIds.has(event.id));

  if (eventsToDelete.length > 0) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .in('id', eventsToDelete.map((event) => event.id));

    if (error) throw error;
  }

  if (eventsToPreserve.length > 0) {
    const { error } = await supabase
      .from('calendar_events')
      .update({
        recurring_pattern_id: null,
        recurring_series_id: patternId,
        is_recurring_generated: false,
        is_recurring_preserved: true
      })
      .in('id', eventsToPreserve.map((event) => event.id));

    if (error) throw error;
  }

  const { error: patternDeleteError } = await supabase
    .from('calendar_recurring_patterns')
    .delete()
    .eq('id', patternId);

  if (patternDeleteError) throw patternDeleteError;

  return {
    patternId,
    generatedCount: 0,
    deletedUnbookedCount: eventsToDelete.length,
    preservedBookedCount: eventsToPreserve.length
  };
};

export const syncPatternAfterExceptionChange = async (patternId: string): Promise<RecurrenceSyncResult> => {
  return syncRecurringPattern(patternId);
};
