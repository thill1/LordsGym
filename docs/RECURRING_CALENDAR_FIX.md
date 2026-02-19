# Recurring Events Not Showing on iPhone – Fix

## Root cause

RLS on `calendar_recurring_patterns` blocked anonymous users (e.g. mobile Safari) from reading pattern data. The join returned `null` for `recurring_pattern`, so events never expanded.

## Solution

1. **RPC function** (`get_calendar_events_for_display`) – Runs with `SECURITY DEFINER` to bypass RLS and return events with pattern data for all users.
2. **CalendarContext** – Uses the RPC first; falls back to the table select if the RPC is not deployed yet.

## Steps to deploy and validate

### 1. Apply the migration

```bash
supabase login
supabase db push
```

### 2. Verify the RPC

```bash
npm run test:calendar-rpc
```

Expected: `OK: RPC returns recurring patterns correctly`  
(Requires `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)

### 3. Deploy the frontend

Commit and push to trigger your usual deploy (e.g. Cloudflare Pages), or run locally:

```bash
npm run dev
```

### 4. Test on iPhone

Open:

- `https://lordsgymoutreach.com/#/calendar`
- or `https://lords-gym.pages.dev/#/calendar`

Recurring events (e.g. Bible Study, 12 step Bible study, Alcoholics Anonymous) should appear across multiple days.

### 5. Optional: debug panel on iPhone

Add `?debug=calendar` to the URL to see diagnostics:

`https://lordsgymoutreach.com/#/calendar?debug=calendar`

You should see "With recurring_pattern" > 0 when the RPC is working.
