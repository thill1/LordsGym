# Lord's Gym — Enhancements Summary

**Date:** February 2025  
**Status:** ✅ Completed & Tested

---

## Code Versions Tested & Deployed

| Role | GitHub Commit | Short SHA | Link |
|------|---------------|-----------|------|
| **Source** (before) | `90f51191cdf9d60b407330204844daadac653d1a` | `90f5119` | [View](https://github.com/thill1/LordsGym/commit/90f5119) |
| **Target** (deployed) | `305152e32328f0ab792720e309663311e9bc3b88` | `305152e` | [View](https://github.com/thill1/LordsGym/commit/305152e) |

[Compare source..target](https://github.com/thill1/LordsGym/compare/90f5119..305152e)

---

## What Changed

### Calendar Enhancements

| Feature | What It Does |
|---------|--------------|
| **Recurring events on mobile** | Bible Study, 12-Step Bible Study, AA, and other recurring events now display correctly on iPhones and all mobile devices |
| **Event type legend** | Color-coded dots by type (Community, Outreach, Fundraisers, Self Help, Holiday) |
| **Jump to date** | Date picker in the toolbar — go to any date without clicking Previous/Next |
| **Show past events** | In List view, toggle between "Upcoming" and "All Events" |
| **Export on mobile** | Export button works on phones for adding events to your personal calendar |
| **Larger event dots** | Easier to see on mobile (2×2 size) |
| **Day popover** | Clicking a day in another month shows events without changing the visible month |
| **Recurring details** | Event details show "Repeats every …" and end date when set |
| **iCal export** | Exported .ics files include recurrence rules for Google Calendar, Apple Calendar, Outlook |

### Store Fixes & Improvements

| Fix / Feature | What It Does |
|---------------|--------------|
| **Admin–store sync** | Products you add, edit, or delete in the admin console now appear (or disappear) correctly on the customer-facing store and home page. Admin and store stay in sync at all times. |
| **Cart quantity fix** | When a customer decreases item quantity to zero using the minus button, the item is removed from the cart instead of staying with quantity 0. Checkout totals are correct. |
| **Accessories size display** | Non-apparel items (e.g., Scripture Wristbands) now show "One Size" in the cart and checkout instead of "Size: L". |
| **Navigation consistency** | The "Return to Shop" button on the empty-checkout page uses the same navigation as the rest of the site. |
| **Image coming soon** | New toggle in product editing: when a photo isn't ready, you can mark "Image coming soon" and customers see a "Coming soon: Lord's Gym merch" placeholder instead of a broken image. |
| **Featured products on home** | Products you mark as "Featured" in the admin now display correctly in the New Arrivals section on the homepage. All featured products show (up to 8); if you feature fewer than 4, the section fills with other products. |

### Quality & Reliability

- **Automated tests** for the store flow (Shop → Add to Cart → Cart → Checkout)
- **Unit tests** for product sync to prevent deleted products from reappearing
- **Documentation** for store architecture, post-mortem, and enhancement summaries

---

## What Was Tested

- ✅ Recurring calendar events on desktop and mobile (including iPhone)
- ✅ Calendar export (.ics) includes recurring events
- ✅ Admin store CRUD: add, edit, delete products (single and bulk)
- ✅ Admin-created products appear on public store; deleted products disappear
- ✅ Cart quantity changes, including reduce-to-zero (item removed)
- ✅ Accessories show "One Size" in cart and checkout
- ✅ Featured products display on home page New Arrivals
- ✅ Image coming soon placeholder on store, cart, and checkout

---

## Planned Future Upgrades

These are under consideration for future releases:

**Calendar**
- Recurring event templates — Save and reuse templates for common recurring events
- Waitlist management — Let visitors join a waitlist when a class is full
- Automated reminders — Email/SMS reminders for upcoming bookings
- Capacity display — Show how full a class is (e.g., "12/15 spots") and close when full

**Store**
- Stripe payment integration (production)
- Inventory enforcement (prevent overselling)
- Order confirmation emails

---

## Questions?

If you notice any issues or have feature requests, please reach out.
