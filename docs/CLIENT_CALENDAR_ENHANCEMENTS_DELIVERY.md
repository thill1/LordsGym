# Lord's Gym Calendar — Enhancements Summary

**Date:** February 2025  
**Status:** ✅ Completed & Tested

## Code Versions Tested & Deployed

| Role | GitHub Commit | Short SHA | Link |
|------|---------------|-----------|------|
| **Source** (before) | `90f51191cdf9d60b407330204844daadac653d1a` | `90f5119` | [View](https://github.com/thill1/LordsGym/commit/90f5119) |
| **Target** (deployed) | `7aca6e978fbbd57c29c7d5cf3e99650beb803696` | `7aca6e9` | [View](https://github.com/thill1/LordsGym/commit/7aca6e9) |

Commits in range: `8a0b710` → `7aca6e9` (5 commits). [Compare source..target](https://github.com/thill1/LordsGym/compare/90f5119..7aca6e9)

---

## What Changed

### Fix: Recurring Events on Mobile
Recurring events (Bible Study, 12-Step Bible Study, AA, etc.) now display correctly on iPhones and all mobile devices. Previously they showed on desktop only.

### New Features

| Feature | What It Does |
|---------|--------------|
| **Event type legend** | Color-coded dots by type (Community, Outreach, Fundraisers, Self Help, Holiday) |
| **Jump to date** | Date picker in the toolbar — go to any date without clicking Previous/Next |
| **Show past events** | In List view, toggle between "Upcoming" and "All Events" |
| **Export on mobile** | Export button works on phones for adding events to your personal calendar |
| **Larger event dots** | Easier to see on mobile (2×2 size) |
| **Day popover** | Clicking a day in another month shows events without changing the visible month |
| **Recurring details** | Event details show "Repeats every …" and end date when set |
| **iCal export** | Exported .ics files include recurrence rules for Google Calendar, Apple Calendar, Outlook |

---

## What Was Tested

- ✅ Recurring events show in Month, Week, Day, and List views
- ✅ Verified on iPhone
- ✅ Calendar export (.ics) includes recurring events
- ✅ Past and future events display correctly across time zones

---

## Planned Future Upgrades

These are under consideration for future releases:

- **Recurring event templates** — Save and reuse templates for common recurring events
- **Waitlist management** — Let visitors join a waitlist when a class is full
- **Automated reminders** — Email/SMS reminders for upcoming bookings
- **Capacity display** — Show how full a class is (e.g., "12/15 spots") and close when full

---

## Questions?

If you notice any issues or have feature requests, please reach out.
