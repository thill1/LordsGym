# Recovering Calendar Data from a Paused Supabase Project

When a Supabase project is **paused**, the database is suspended—you can’t run queries or use the API until it’s restored. The data is **not deleted**; it stays in Supabase’s storage until you restore or the project is removed.

## How to get your calendar data back

### Option 1: Restore the project, then export (recommended)

1. **Restore the project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) and open the paused project.
   - Go to **Project Settings** (gear) → **General**.
   - Click **Restore project** and wait for it to come back (often a few minutes). You’ll get an email when it’s done.

2. **Export calendar data**
   - **Option A — Backup from Dashboard**  
     Go to **Database** → **Backups** → **Scheduled backups**. If there’s a recent backup, download the `.sql` file. It includes all tables (including calendar). You can open it and search for `calendar_events`, `calendar_bookings`, etc., or restore it into another project and query there.

   - **Option B — Export via script (JSON backup)**  
     From your repo (with the restored project’s URL and keys in `.env.local`), run:
     ```bash
     node --env-file=.env.local scripts/export-calendar-backup.mjs
     ```
     This writes `scripts/calendar-backup/*.json` (one file per calendar table). Use these as a backup or to re-import into another project.

   - **Option C — SQL Editor: copy table data**  
     In the restored project, open **SQL Editor** and run the queries in `scripts/export-calendar-data.sql`. For each result set, use **Download as CSV** to save the data.

   - **Option D — Full DB dump with `pg_dump`**  
     In **Project Settings** → **Database**, copy the **Connection string** (URI). Then run:
     ```bash
     pg_dump "$DATABASE_URL" -t instructors -t calendar_recurring_patterns -t calendar_recurring_exceptions -t calendar_events -t calendar_bookings --data-only -f calendar_backup.sql
     ```
     That creates `calendar_backup.sql` with only the data for those tables.

### Option 2: Backup download while paused (if available)

Some paused projects still allow opening **Database** → **Backups** in the dashboard. If you see **Scheduled backups** and a list of dates, try downloading the latest backup. That’s a full DB dump; you can restore it elsewhere or open the file and extract the calendar-related `INSERT`/`COPY` blocks.

If the Backups page is unavailable or empty while paused, use Option 1 (restore, then export).

## Calendar tables to recover

| Table | Purpose |
|-------|--------|
| `instructors` | Instructor profiles (linked from events) |
| `calendar_recurring_patterns` | Recurring class patterns |
| `calendar_recurring_exceptions` | Exceptions to recurring patterns |
| `calendar_events` | Individual events/classes |
| `calendar_bookings` | Member bookings for events |

## After you have the backup

- **Restore into a new project:** Create a new Supabase project, run your migrations (`npm run db:push`), then run the `calendar_backup.sql` (or the INSERT script) in the SQL Editor.
- **Restore into the same project:** If you restored the original project and only needed a copy, you can keep using the project as-is; the backup is just for safety.

## Note on free-tier restores

A few users have reported table data missing after restoring a free-tier project from pause. If that happens, contact [Supabase support](https://supabase.com/dashboard/support/new). To reduce risk, **as soon as the project is restored**, run one of the export steps above so you have a copy before any further changes.
