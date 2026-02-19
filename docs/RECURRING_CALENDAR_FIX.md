# Recurring Calendar Defect – Root Cause & Hardening

## Root Cause

**Symptom:** Recurring events set for Monday appeared on Tuesday.

**Cause:** A **day-of-week convention mismatch** between the UI, expansion logic, and database:

| Convention | Sunday | Monday | Tuesday | ... | Saturday |
|------------|--------|--------|---------|-----|----------|
| **Database (ISO 8601)** | 7 | 1 | 2 | ... | 6 |
| **UI / JS `getDay()`** | 0 | 1 | 2 | ... | 6 |

The UI sent day indices (0–6) directly to the database, while the schema and expansion logic expected ISO format (1–7). The expansion used `d.getDay()` (0–6) against values that were sometimes stored or interpreted as 1–7, causing an off‑by‑one error for some days (e.g. Monday).

---

## Code Paths Audited & Fixed

### 1. **Save path** (`CalendarManager.tsx`)

- **Before:** `formData.days_of_week` (UI 0–6) was written directly to the DB.
- **After:** Uses `toDbDay()` so 0→7, 1→1, …, 6→6.
- **Validation:** Filters out values outside 0–6 before conversion.

### 2. **Load-for-edit path** (`CalendarManager.tsx`)

- **Before:** DB values (1–7) were used as UI indices without conversion.
- **After:** Uses `rawDays.map(toJsDay)` so DB 7→0, DB 1–6 unchanged.
- **Validation:** Filters out invalid indices after conversion.

### 3. **Expansion path** (`calendar-utils.ts` → `expandRecurringEvents`)

- **Before:** Used `pattern.days_of_week` directly in `days.includes(d.getDay())`, mixing conventions.
- **After:** Uses `normalizeDaysForExpand()` to convert DB values to JS `getDay()` format.
- **Validation:** Handles string numbers from Postgres and filters invalid values.

### 4. **Display path** (`RecurringEventsManager.tsx`)

- **Before:** Used `DAYS[d]` with DB values; `DAYS[7]` was undefined.
- **After:** Uses `DAYS[toJsDay(d)]` so all days render correctly.

### 5. **Data flow** (`CalendarContext.tsx`)

- Patterns loaded from Supabase are passed through unchanged.
- Conversion is done in `expandRecurringEvents` via `normalizeDaysForExpand`.
- No change required in CalendarContext.

---

## Hardening

1. **Conversion helpers** (`lib/calendar-utils.ts`)
   - `toJsDay()`, `toDbDay()` used consistently.
   - `normalizeDaysForExpand()` accepts `unknown[]`, parses with `Number()`, and filters invalid values.

2. **Save validation** (`CalendarManager.tsx`)
   - Only days 0–6 are sent to the DB.

3. **Load validation** (`CalendarManager.tsx`)
   - Converted values outside 0–6 are filtered when populating the form.

4. **Backward compatibility**
   - Old data stored as 0–6 still works; `toJsDay(0)=0`, `toJsDay(1)=1`, etc.
   - Only 7 needs mapping to 0 (Sunday).

---

## Files Touched

| File | Purpose |
|------|---------|
| `lib/calendar-utils.ts` | `toJsDay`, `toDbDay`, `normalizeDaysForExpand`, string handling |
| `components/admin/CalendarManager.tsx` | Conversion on save/load, validation |
| `components/admin/RecurringEventsManager.tsx` | Correct day display via `toJsDay` |

---

## Production Checklist

- [x] All code paths that use `days_of_week` use the conversion helpers.
- [x] Existing 0–6 data continues to work.
- [x] New data is saved in 1–7 (ISO) format.
- [x] Invalid or non-numeric values are filtered.
- [x] TypeScript compiles without errors.
