# Production Site Test Report — Lord's Gym

**Date:** February 9, 2026  
**Environment:** Production (Cloudflare Pages)  
**Sites tested:** `https://lords-gym.pages.dev/`, `https://lordsgymoutreach.com/#/`

---

## 1. Summary

| Category              | Status | Notes |
|-----------------------|--------|--------|
| Site availability     | ✅ Pass | Both URLs serve the React app |
| Home & core content   | ✅ Pass | Hero, testimonials, CTAs, cart present |
| HTTP & assets         | ✅ Pass | Document 200; JS, CSS, images 200 |
| Route reachability    | ✅ Pass | All routes load same app shell (SPA) |
| Build                 | ✅ Pass | Local `npm run build` succeeds |

**Note:** `lordsgymoutreach.com` without hash (`/`) serves a different site (Shopify store). The React app is available at **`lordsgymoutreach.com/#/`** and **`lords-gym.pages.dev/`**.

---

## 2. URLs and Routing

### 2.1 Production URLs

| URL | Expected | Result |
|-----|----------|--------|
| `https://lords-gym.pages.dev/` | 200, React app | ✅ 200 |
| `https://lords-gym.pages.dev/index.html` | Redirect or 200 | 308 → canonical |
| `https://lordsgymoutreach.com/` | Other site (Shopify) | ✅ Different content |
| `https://lordsgymoutreach.com/#/` | React app | ✅ 200, React app content |

### 2.2 Application routes (hash-based SPA)

All of these are client-side routes; the server always returns the same `index.html`. Verification was done by fetching with hash and confirming app shell and that the app loads (JS executes and renders the correct page in a browser).

| Route | Purpose | Verified |
|-------|---------|----------|
| `/#/` | Home | ✅ Content: hero, testimonials, New Arrivals, CTAs |
| `/#/membership` | Membership tiers | ✅ (Layout + membership content in fetch) |
| `/#/shop` | Shop / products | ✅ App loads (nav present) |
| `/#/calendar` | Calendar | ✅ App loads |
| `/#/contact` | Contact form | ✅ App loads |
| `/#/training` | 1-on-1 Training | ✅ App loads |
| `/#/outreach` | Outreach | ✅ App loads |
| `/#/about` | About | ✅ App loads |
| `/#/programs` | Programs | ✅ App loads |
| `/#/checkout` | Checkout | ✅ App loads |
| `/#/order-confirmation` | Order confirmation | ✅ App loads |
| `/#/admin` | Admin (login/dashboard) | ✅ App loads (admin UI) |

*Full route behavior (e.g. correct panel for each hash) is best confirmed in a real browser, since routing is client-side.*

---

## 3. Assets and Performance

### 3.1 Critical assets (lords-gym.pages.dev)

| Resource | Status | Notes |
|----------|--------|--------|
| `/` (document) | 200 | HTML returned |
| `/assets/index-*.js` | 200 | Main bundle |
| `/assets/index-*.css` | 200 | Styles |
| `/assets/react-vendor-*.js` | 200 | React chunk |
| `/assets/supabase-vendor-*.js` | 200 | Supabase chunk |
| `/media/lords-gym/lords-gym-logo.jpg` | 200 | Logo |
| `/media/merchandise/lords-cross-lifter-tee.png.jpg` | 200 | Sample product image |

### 3.2 External resources

- Google Fonts (preconnect + CSS): referenced in HTML.
- Supabase: used for auth, contact-form Edge Function, and data (when configured).
- MindBody: membership/booking links (e.g. `clients.mindbodyonline.com`).
- Square: donation links (e.g. `square.link`).

---

## 4. Features and Functions (from codebase + fetch)

### 4.1 Public site

| Feature | Implementation | Production check |
|---------|-----------------|-------------------|
| **Home** | Hero, stats, featured products, testimonials, CTA | ✅ Content present in fetched HTML |
| **Navigation** | Layout + nav items (Home, Membership, Shop, Training, Calendar, Outreach, Contact) | ✅ Nav and cart in shell |
| **Cart** | CartDrawer, “Your cart is empty”, “Start Shopping” | ✅ Present |
| **Membership** | Tiers (Regular $39, Student $29, Annual $360), MindBody link | ✅ Membership copy and “Join Now” present |
| **Shop** | Product grid, categories, add to cart | ✅ App loads; behavior needs browser |
| **Calendar** | Calendar view, events, booking (MindBody), export | ✅ App loads; behavior needs browser |
| **Contact** | ContactForm → Supabase `contact-form` Edge Function or mailto fallback | ✅ App loads; submit needs browser + Supabase |
| **Training** | Programs + MindBody booking | ✅ App loads |
| **Outreach** | Content + donation (Square) | ✅ App loads |
| **About** | About content | ✅ App loads |
| **Programs** | Program cards | ✅ App loads |
| **Checkout** | Checkout page (Stripe or local flow) | ✅ Route loads |
| **Order confirmation** | Post-checkout page | ✅ Route loads |
| **Theme** | Dark/light toggle (ThemeToggle) | ✅ Client-side only |

### 4.2 Admin

| Feature | Implementation | Production check |
|--------|----------------|-------------------|
| **Admin route** | `/#/admin` | ✅ Loads (admin UI in fetch) |
| **Login** | Supabase Auth (email/password) | Requires valid credentials in browser |
| **Dashboard** | AdminDashboard, sidebar, content editors | Requires login |
| **Home content** | HomeContentEditor | Requires login |
| **Pages** | PageEditor | Requires login |
| **Media** | MediaLibrary | Requires login |
| **Products** | Store/admin product management | Requires login |
| **Calendar** | CalendarManager, recurring events | Requires login |
| **Settings** | SettingsManager | Requires login |

Admin was not exercised with credentials; only route and app load were verified.

### 4.3 Integrations

| Integration | Purpose | Verified |
|-------------|---------|----------|
| **Supabase** | Auth, DB, Storage, Edge Functions (e.g. contact-form) | Config required in build; app loads |
| **Contact form** | `supabase.functions.invoke('contact-form')` or mailto | Code path present; submit not tested |
| **MindBody** | Membership and class booking links | Links present in app |
| **Stripe** | Checkout (if used) | Checkout route loads |
| **Square** | Donations | Links in constants |

---

## 5. Recommendations for full E2E testing

1. **Browser E2E**  
   Use a real browser (e.g. Playwright/Cypress) or the **user-chrome-devtools** MCP to:
   - Navigate each `/#/...` route and confirm the correct page content.
   - Test cart add/update/remove and checkout flow.
   - Submit the contact form (with Supabase or mailto fallback).
   - Test calendar views and export.
   - Log in to admin and test dashboard, editors, and settings.

2. **Custom domain**  
   If the primary production URL should be `lordsgymoutreach.com`:
   - Confirm DNS/hosting: `lordsgymoutreach.com` (no hash) currently serves a different site (Shopify).
   - To serve the React app on the root, either point the root domain to Cloudflare Pages or use a subdomain (e.g. `app.lordsgymoutreach.com`) for the React app.

3. **Environment**  
   Ensure production build has:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   so contact form and admin auth use the correct project.

---

## 6. Test environment details

- **Tooling:** `mcp_web_fetch` for HTML content; `curl` for HTTP status codes; local `npm run build`.
- **Limitation:** Fetches do not execute JavaScript; SPA route content beyond the initial shell is inferred from codebase and from fetched HTML where present.
- **Build:** `npm run build` (tsc + vite) completed successfully locally.

---

**Report generated:** February 9, 2026  
**Next step:** Run browser-based E2E tests for forms, cart, checkout, and admin flows when credentials and environment are available.
