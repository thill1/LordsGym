# Calendar Recurring Functionality & Enhancements – Summary

## Overview

This document summarizes all changes to recurring events and calendar UX made to fix the "recurring events not showing on mobile" issue and improve the calendar experience.

---

## 1. Recurring Events – Root Cause & Fix

### Problem

- Recurring events appeared on desktop but **not on iPhone** (or in anonymous/incognito).
- Same code runs everywhere; the difference was **runtime environment**.

### Root Causes

1. **RLS (Row Level Security)** – `calendar_recurring_patterns` allowed SELECT only for authenticated users. Anonymous visitors (including mobile Safari) received `recurring_pattern: null` from the join, so events were never expanded.
2. **UTC timezone bug** – Using `toISOString().split('T')[0]` for dates shifted events in western timezones (e.g. PST midnight → previous day in UTC), so some recurring instances didn’t show.

### Fixes Applied

#### A. RPC function (bypass RLS)

- **`get_calendar_events_for_display()`** – Postgres function with `SECURITY DEFINER` that returns calendar events with joined recurring pattern data.
- Runs with elevated privileges, so it bypasses RLS and works for anonymous users.
- Returns `booked_count` per event.
- `GRANT EXECUTE` to `anon` and `authenticated`.

#### B. CalendarContext changes

- Uses the RPC first: `supabase.rpc('get_calendar_events_for_display')`.
- Falls back to the table select if the RPC is missing.
- `toRecurringPattern()` made more robust for Supabase (arrays, nulls, nested objects).

#### C. RLS policies

- `calendar_recurring_patterns`: SELECT allowed for everyone (`USING (true)`).
- `calendar_recurring_exceptions`: SELECT allowed for everyone.

#### D. UTC / timezone fix in `lib/calendar-utils.ts`

- **`toLocalDateKey(d)`** – Returns local date as `YYYY-MM-DD` using `getFullYear()`, `getMonth()`, `getDate()` instead of UTC.
- Used in:
  - `expandRecurringEvents()` – for occurrence IDs and exception checks.
  - `getEventsForDate()` – for date filtering.
- **`pattern.end_date`** – Date-only strings (e.g. `"2025-12-31"`) parsed as local end-of-day so the last recurrence day is included.

#### E. `normalizeDaysForExpand()`

- Normalizes raw `days_of_week` for expansion.
- Handles: `number[]`, string arrays, JSON strings, null/undefined.
- Supports PostgREST and edge cases like mobile Safari.

---

## 2. Recurring Event Modal & Composite IDs

### Composite instance IDs

- Expanded recurring instances use IDs like `baseId-YYYY-MM-DD`.
- **`parseRecurringEventId()`** – Parses instance ID into `baseId` and `occurrenceDate`.
- **`getBaseEventId()`** – Returns base ID for booking (DB expects base event UUID).

### CalendarEventModal behavior

- Resolves events from composite IDs (falls back to base event when needed).
- For recurring instances, builds display event with correct occurrence date/time.
- Shows recurrence label (e.g. "Repeats every 2 weeks on Monday, Wednesday").
- Booking uses `getBaseEventId()` for the DB event ID.
- Shows "Until [date]" when `recurring_pattern.end_date` is set.

---

## 3. iCal Export with RRULE

- Export includes recurring events with RRULE.
- Daily: `FREQ=DAILY;INTERVAL=N`
- Weekly: `FREQ=WEEKLY;INTERVAL=N;BYDAY=MO,WE` (based on `days_of_week`)
- Monthly: `FREQ=MONTHLY;INTERVAL=N`
- `UNTIL` set when `end_date` is present.

---

## 4. Calendar UX Enhancements

| Feature | Description |
|---------|-------------|
| **Event type legend** | Toolbar legend for Community, Outreach, Fundraisers, Self Help, Holiday with colored dots |
| **Jump to date** | Date input in the toolbar to jump to a specific date |
| **List view: show past** | Toggle "Show past events" / "Show upcoming only" in List view |
| **Export on mobile** | Export button visible on mobile (icon-only on small screens) |
| **DayPopover** | `role="dialog"`, `aria-modal`, focus trap, Escape to close, `pointerdown` for outside-click |
| **Adjacent month click** | Clicking a day in an adjacent month opens the popover only; does not change the visible month |
| **Mobile dots** | Event dots on mobile increased from 1.5×1.5 to 2×2 for better visibility on iPhone |

---

## 5. Debug Panel

- **URL**: Add `?debug=calendar` (e.g. `https://yoursite.com/#/calendar?debug=calendar`).
- **Hash routing**: App router strips query params from the hash so `/#/calendar?debug=calendar` routes correctly.
- **Shows**:
  - Device (Mobile vs Desktop)
  - Base events count
  - Events with `recurring_pattern`
  - Expanded count
  - Today’s events
  - Timezone
  - RLS hint when patterns are missing despite `recurring_pattern_id`

---

## 6. Infrastructure & Tooling

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/supabase-db-push.mjs` | Runs `supabase db push` with `SUPABASE_ACCESS_TOKEN` from `.env.local` |
| `scripts/apply-calendar-migration.mjs` | Applies calendar migration via Supabase Management API (fallback when db push conflicts) |
| `scripts/test-calendar-rpc.mjs` | Verifies RPC returns events with recurring patterns |

### npm scripts

- `npm run db:push` – Apply Supabase migrations.
- `npm run test:calendar-rpc` – Test RPC response.

### Supabase setup

- **Token**: Add `SUPABASE_ACCESS_TOKEN` to `.env.local` (from [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)).
- **Rule**: `.cursor/rules/supabase-db.mdc` – Use `npm run db:push` for migrations.
- **Docs**: `docs/SUPABASE_AGENT_SETUP.md` – Token setup steps.

---

## 7. Migrations

### Applied

- **`20260219_calendar_recurring_public.sql`** – Includes:
  - `get_calendar_events_for_display()` RPC
  - RLS policies for public read on `calendar_recurring_patterns` and `calendar_recurring_exceptions`

### Other migrations

- **`006_popup_modals.sql`** – Popup modals column (renamed from `004` to resolve version conflict).
- Migration history conflicts were worked around via Management API for the calendar fix.

---

## 8. Files Changed

| Area | Files |
|------|-------|
| **Backend / DB** | `supabase/migrations/20260219_calendar_recurring_public.sql`, `006_popup_modals.sql` |
| **Data loading** | `context/CalendarContext.tsx` |
| **Date logic** | `lib/calendar-utils.ts` |
| **UI** | `components/CalendarView.tsx`, `components/CalendarEventModal.tsx`, `pages/Calendar.tsx` |
| **Routing** | `App.tsx` |
| **Tooling** | `scripts/supabase-db-push.mjs`, `scripts/apply-calendar-migration.mjs`, `scripts/test-calendar-rpc.mjs` |
| **Config** | `package.json`, `env.example` |
| **Docs** | `docs/RECURRING_CALENDAR_FIX.md`, `docs/RECURRING_EVENTS_MOBILE_FIX.md`, `docs/SUPABASE_AGENT_SETUP.md` |
| **Rules** | `.cursor/rules/supabase-db.mdc` |

---

## 9. Validation

- Recurring events appear on month, week, day, and list views.
- Works on iPhone and mobile Safari.
- iCal export includes RRULE for recurring events.
- `npm run test:calendar-rpc` passes and reports events with recurring patterns.
