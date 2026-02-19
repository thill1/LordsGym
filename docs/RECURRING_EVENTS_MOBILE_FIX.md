# Recurring Events Not Showing on Mobile – Root Cause & Fix

## Why desktop and mobile would differ

There is **no separate mobile vs desktop implementation**. The same code runs everywhere. The difference comes from:

1. **RLS (Row Level Security)** – If `calendar_recurring_patterns` only allows SELECT for authenticated users, anonymous visitors (including mobile Safari) get `recurring_pattern: null` from the join. The expansion logic then treats them as one-off events, so recurring instances never appear.

2. **Auth state** – On desktop, you might be logged in (e.g. in Admin), so the join works and you see recurring events. On mobile, you’re typically not logged in, so you don’t.

3. **Timezone** – PST/PDT can shift UTC boundaries and affect which dates get expanded; this was fixed with `toLocalDateKey()`.

## Root cause

The Supabase RLS policy on `calendar_recurring_patterns` restricted SELECT to authenticated users. Anonymous visitors could not read recurring pattern data, so the join returned `null` and recurring events were not expanded.

## Fix

Apply the migration that allows public read access:

```bash
supabase db push
```

Or, if using the Supabase Dashboard, run the SQL from:

`supabase/migrations/20260219_calendar_recurring_public_read.sql`

## Debug panel

To diagnose recurring events on any device, add `?debug=calendar` to the URL:

- Desktop: `https://yoursite.com/#/calendar?debug=calendar`
- Mobile: same URL (or add to a bookmark)

The debug panel shows:

- **Base events** – Total events from the database
- **With recurring_pattern** – Events that have pattern data from the join (if 0, RLS or join is blocking)
- **Expanded** – Count after expansion
- **Today events** – Events for today
- **Timezone** – Device timezone
- **Sample recurring** – First recurring event’s pattern (if any)

## Avoiding this in the future

1. **Public-facing data** – If data is needed for anonymous visitors (e.g. public calendar), ensure RLS allows public read for the relevant tables.
2. **Test as anon** – Test the calendar in an incognito/private window (or logged out) to mirror mobile behavior.
3. **Debug panel** – Use `?debug=calendar` when troubleshooting.
