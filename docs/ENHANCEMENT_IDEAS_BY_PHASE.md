# Lord's Gym — Enhancement Ideas by Phase

**Generated:** February 19, 2025  
**Codebase:** LordsGym (lords-gym-auburn)

---

## 1. Pages & Routes Summary

| Route | Purpose |
|-------|---------|
| `/` | Home — hero, values, testimonials carousel, featured products, CTAs |
| `/membership` | Membership tiers (Regular $39, Student $29, Annual) — links to Mindbody CRM |
| `/shop` | Product catalog — category filters, cart |
| `/checkout` | Checkout — contact, billing, mock payment (2s delay, no real payment) |
| `/order-confirmation` | Post-checkout confirmation |
| `/calendar` | Events — Month/Week/Day/List, recurring, iCal export, event details |
| `/training` | 1-on-1 Personal Training — coach selection, Mindbody widget |
| `/programs` | Training programs + Mindbody class schedule |
| `/outreach` | Outreach — donation CTAs, Square links, photo grid |
| `/contact` | Contact form (Supabase Edge Function), address, hours, map |
| `/about` | About page |
| `/admin` | Admin CMS — dashboard, Home, Pages, Testimonials, Store, Calendar, Media, Users, Popups, Analytics, Activity, Settings, SEO |

**Orphan page:** `pages/Community.tsx` exists but has no route or navigation link.

---

## 2. Main Feature Areas

| Area | Components / Data | Notes |
|------|-------------------|-------|
| **Calendar** | CalendarContext, CalendarView, CalendarManager, RecurringEventsManager, RecurringExceptionsManager, BookingHistory, CalendarBookingForm | Supabase: `calendar_events`, `calendar_recurring_patterns`, `calendar_recurring_exceptions`, `calendar_bookings`, `instructors`; RPC `get_calendar_events_for_display` |
| **Membership** | Membership page | Redirects to Mindbody; Stripe schema exists but not used in UI |
| **Store** | Shop, ShopifyProduct, CartDrawer, Checkout, StoreContext | Products from Supabase (fallback to `constants.ts`); cart in memory; checkout mock |
| **Admin** | AdminSidebar, AdminDashboard, PageEditor, HomeContentEditor, TestimonialsManager, CalendarManager, MediaLibrary, UserManagement, SettingsManager, PopupModalsManager, SEOManager, ProductBulkOperations, ActivityLogs, AnalyticsDashboard | 13 admin tabs |
| **Outreach** | Outreach page | Square donation links, donation amount presets |
| **Training / Programs** | Training, Programs, MindbodyWidget | Mindbody for booking/schedule |
| **Contact** | ContactForm | Supabase Edge Function `contact-form` |

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 |
| **Build** | Vite 5, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (Auth, Postgres, Storage, Edge Functions) |
| **Routing** | Custom hash-based router (`window.location.hash`) |
| **State** | StoreContext, AuthContext, CalendarContext, ToastContext |
| **Hosting** | Cloudflare Pages / GitHub Pages |
| **Integrations** | Mindbody, Square, Google Fonts, Google Maps embed |

---

## 4. Gaps, Technical Debt & Improvement Opportunities

| Category | Issue | Impact |
|----------|-------|--------|
| **Payments** | Checkout is mock — no Stripe/Square; form submits, clears cart, redirects after 2s | Store can't process real orders |
| **Membership** | Stripe migrations exist (`memberships`, `payment_intents`) but no UI wiring | Membership payments not integrated |
| **Routing** | Hash routing instead of React Router | Limited SEO, URL structure, code-splitting |
| **Orphan page** | `Community.tsx` not routed | Content not reachable |
| **Linting** | `package.json`: `"lint": "echo 'No linter configured'"` | No automated style/error checks |
| **Square** | `SQUARE_DONATION_LINKS` has TODOs for preset amounts | Donation UX not optimized |
| **Store source** | Products from Supabase with `constants.ts` fallback | Risk of inconsistent product data |
| **Analytics** | Page views in Supabase; basic bot filtering | No event tracking, funnels, or deeper analytics |
| **Tests** | Vitest, but minimal coverage (e.g. `lib/calendar-utils.test.ts`) | Low confidence for refactors |

---

## 5. Phased Enhancement Roadmap

---

### Phase 1: Foundation & Quality (Est. 2–3 weeks)

**Goal:** Improve stability, maintainability, and visibility before new features.

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 1.1 | Add ESLint + Prettier | ~1 day | Configure and fix critical lint issues |
| 1.2 | Add or wire Community route | ~0.5 day | Route `/community` or merge into Outreach |
| 1.3 | Migrate to React Router | ~2–3 days | Replace hash router for SEO and cleaner URLs |
| 1.4 | Expand unit tests | ~3–5 days | Calendar utils, store helpers, auth flows |
| 1.5 | Add error boundaries for main feature areas | ~1 day | Better error handling for Calendar, Store, Admin |

**Rationale:** Linting, routing, and tests reduce bugs and make later phases safer.

---

### Phase 2: Store & Payments (Est. 4–6 weeks)

**Goal:** Enable real product sales and membership payments.

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 2.1 | Integrate Stripe Checkout for Store | ~1–2 weeks | Use `supabase/functions/stripe-checkout`; real payment flow |
| 2.2 | Persist cart in `localStorage` | ~0.5 day | Cart survives refresh and navigation |
| 2.3 | Implement membership payments via Stripe | ~2–3 weeks | Use `memberships` + `payment_intents`; link to Mindbody/CRM as needed |
| 2.4 | Order history in Admin | ~2–3 days | Query orders from Stripe or dedicated table |
| 2.5 | Low-inventory warnings | ~1 day | Use `products.inventory` in Admin and Store |

**Rationale:** Store and membership are core revenue; Stripe schema is already in place.

---

### Phase 3: Calendar & Bookings (Est. 3–4 weeks)

**Goal:** Strengthen calendar UX and booking management (per `CLIENT_CALENDAR_ENHANCEMENTS_DELIVERY.md`).

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 3.1 | Capacity display (e.g. "12/15 spots") | ~2–3 days | Use `calendar_events.capacity` and `calendar_bookings` count |
| 3.2 | Waitlist when class is full | ~1 week | New `calendar_bookings.status` values; Admin waitlist UI |
| 3.3 | Recurring event templates | ~1 week | Admin CRUD for templates; quick creation of recurring events |
| 3.4 | Automated reminders (email/SMS) | ~1–2 weeks | Supabase Edge Function + email/SMS provider |
| 3.5 | Booking confirmation emails | ~2–3 days | Trigger on booking creation |
| 3.6 | Close registration when full | ~0.5 day | Disable booking button when capacity reached |

**Rationale:** Aligns with planned calendar upgrades and improves class utilization.

---

### Phase 4: Outreach & Donations (Est. 2–3 weeks)

**Goal:** Improve donation flow and outreach visibility.

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 4.1 | Configure Square preset donation links | ~0.5 day | Use separate links for $25, $50, $100 |
| 4.2 | Embeddable donation widget | ~2–3 days | Reusable component for Outreach/other pages |
| 4.3 | Volunteer signup form | ~1–2 days | Simple form + Supabase storage; optional email confirmation |
| 4.4 | Outreach impact metrics (Admin) | ~2–3 days | Track donations, volunteers, events; store in Supabase |
| 4.5 | Integrate or replace Community page | ~1 day | Decide on `/community` vs Outreach consolidation |

**Rationale:** Outreach is central to the mission; better donation UX increases giving.

---

### Phase 5: Admin & Operations (Est. 3–4 weeks)

**Goal:** Make admin more efficient and informative.

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 5.1 | Admin role-based access | ~1 week | Different permissions for staff vs super-admin |
| 5.2 | Scheduled popups / announcements | ~2–3 days | Start/end dates for popup modals |
| 5.3 | Bulk actions for calendar events | ~2–3 days | Bulk edit, delete, duplicate events |
| 5.4 | Rich analytics (conversion, top pages, funnels) | ~1–2 weeks | Build on `page_views`; add goals and basic funnels |
| 5.5 | Export for activity logs and analytics | ~1–2 days | CSV/Excel for reporting |
| 5.6 | Media library bulk upload | ~1–2 days | Multi-file upload with progress |
| 5.7 | Search/filter in activity logs | ~0.5 day | Filter by action, user, date range |

**Rationale:** Admin improvements reduce manual work and support data-driven decisions.

---

### Phase 6: UX & Engagement (Est. 2–3 weeks)

**Goal:** Improve discovery, retention, and conversion.

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 6.1 | Event reminders / notifications | ~1 week | Extend Phase 3.4; optional push/email |
| 6.2 | Member testimonials submission form | ~2–3 days | Public form + Admin approval |
| 6.3 | Newsletter signup | ~1–2 days | Supabase table + email provider integration |
| 6.4 | Mobile PWA / install prompt | ~1 day | Service worker already present |
| 6.5 | Class/event filtering on Calendar | ~1 day | Filter by class type, instructor |
| 6.6 | Improved loading states and skeletons | ~2–3 days | Reduce layout shift and perceived load time |

**Rationale:** Better engagement supports membership retention and outreach reach.

---

### Phase 7: Platform & Integrations (Est. 2–4 weeks)

**Goal:** Tie together gym operations and external tools.

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 7.1 | Sync with Mindbody (members/classes) | ~2–3 weeks | API integration; optional sync jobs |
| 7.2 | Shopify product sync (if used) | ~1 week | Align `SHOPIFY_STORE_URL` products with Supabase |
| 7.3 | Google Analytics 4 (or similar) | ~1–2 days | Use `settings.google_analytics_id` |
| 7.4 | Structured data / schema.org | ~1 day | Events, org, local business for SEO |
| 7.5 | Contact form duplicate detection | ~0.5 day | Rate limiting or deduplication to reduce spam |

**Rationale:** Integrations reduce double-entry and improve analytics and discoverability.

---

## 6. Summary Table

| Phase | Focus | Est. Duration | # Items | Priority Items |
|-------|-------|---------------|---------|----------------|
| 1 | Foundation & quality | 2–3 weeks | 5 | Lint, React Router, tests |
| 2 | Store & payments | 4–6 weeks | 5 | Stripe Checkout, membership payments |
| 3 | Calendar & bookings | 3–4 weeks | 6 | Capacity, waitlist, templates, reminders |
| 4 | Outreach & donations | 2–3 weeks | 5 | Square presets, volunteer signup |
| 5 | Admin & operations | 3–4 weeks | 7 | Roles, analytics, bulk actions |
| 6 | UX & engagement | 2–3 weeks | 6 | Testimonials form, newsletter, PWA |
| 7 | Platform & integrations | 2–4 weeks | 5 | Mindbody, GA4, structured data |

**Total:** 39 enhancement items across 7 phases | **Est. total duration:** 18–27 weeks

---

## 7. References

- `docs/CLIENT_CALENDAR_ENHANCEMENTS_DELIVERY.md` — Calendar enhancements, recurring events, planned upgrades
- `docs/PRODUCTION_SITE_TEST_REPORT.md` — Routes, hosting, integrations (if present)
- `supabase/migrations/` — Schema for calendar, products, settings, Stripe-related tables
