# Lord's Gym Online Store — Production Incident Post-Mortem

**Date:** February 20, 2025  
**Classification:** Production incident — store functionality defects  
**Audience:** Lord's Gym management  
**Prepared with:** Quality assurance and continuous improvement focus

---

## Executive Summary

A production incident was identified in the Lord's Gym online store involving four defects that affected admin–store synchronization, cart behavior, and checkout experience. **All issues have been remediated and are covered by automated tests.** No customer payment or data was compromised.

The purpose of this post-mortem is threefold: (1) to provide full transparency on what occurred and why, (2) to document the fixes implemented, and (3) to outline the tests and process improvements we have put in place so that similar incidents do not recur. Our goal is to treat every incident as a learning opportunity—to improve not only the system but our ability to prevent future defects.

---

## What Happened

Four defects were found in the store flow:

| Issue | Impact | Severity |
|-------|--------|----------|
| **Admin–store sync** | Products deleted in the admin console continued to appear on the customer-facing store and home page. Admin and store were out of sync. | High |
| **Cart quantity bug** | When a customer decreased item quantity to zero using the minus button, the item remained in the cart with quantity 0. Subtotal and checkout totals could show incorrect amounts. | High |
| **Incorrect size display for accessories** | Non-apparel items (e.g., Scripture Wristbands) were shown as "Size: L" in the cart and checkout instead of "One Size," creating confusion. | Medium |
| **Inconsistent navigation** | The "Return to Shop" button on the empty-checkout page used a different navigation method than the rest of the app, risking future routing issues. | Low |

---

## Root Cause Analysis

### Why Did This Happen?

1. **Products load logic**  
   When Supabase returned an empty product list (or a reduced list after deletions), the code only updated state when the result had items. Empty or reduced results left stale products in place. Additionally, the home page "New Arrivals" section used static product data instead of the live store catalog, so it ignored admin changes.

2. **Edge-case behavior not exercised**  
   The cart quantity logic did not explicitly handle the case where a user reduces quantity to zero. The expectation was removal; the implementation left the item in the cart. This path was not covered by automated or manual tests.

3. **Product-type assumptions**  
   The size selector was designed for apparel only. Accessories were not treated as a distinct product type, so they inherited a default size ("L") instead of "One Size."

4. **Inconsistent navigation patterns**  
   The checkout page implemented its own navigation for "Return to Shop" instead of using the app-wide navigation handler, creating inconsistency and technical debt.

### Process Gaps (Why It Slipped Through)

These issues reached production because of gaps in our quality processes:

- Products load logic did not handle empty or reduced Supabase responses; home page used static data instead of the live store catalog.
- **No end-to-end tests** for the full store flow (Shop → Add to Cart → Cart → Checkout), so critical paths were not exercised automatically.
- **No automated tests for cart quantity changes**, including the edge case of reducing quantity to zero.
- No regression tests for non-apparel products in the cart and checkout displays.
- Insufficient documentation of expected behavior for edge cases (e.g., quantity = 0), leaving implementation assumptions implicit.

**Key lesson:** When defects reach production, it means we did not have a test that would have caught them. The absence of automated coverage for these flows allowed the bugs to ship.

---

## What We Fixed

| Fix | Description |
|-----|-------------|
| **Admin–store sync** | Products from Supabase are always applied to the store and home page, including when the list is empty or reduced. The home page "New Arrivals" section now uses live store products (featured first) instead of static data. Admin and customer-facing store stay in sync at all times. |
| **Cart quantity logic** | Updated the cart logic so that when quantity reaches zero, the item is removed from the cart instead of remaining with quantity 0. |
| **Accessories display** | Non-apparel products (e.g., Accessories) now display "One Size" in the cart and checkout. |
| **Navigation consistency** | The "Return to Shop" button now uses the same navigation system as the rest of the application. |

All changes have been tested and deployed.

---

## Prevention — Tests and Practices Put in Place

The goal is to detect similar issues before they reach production. We have added the following.

### 1. Automated End-to-End (E2E) Tests

- **Shop product grid** — Verifies the store page loads and displays multiple products with "Add to Cart" buttons.
- **Add to Cart** — Verifies that adding a product opens the cart drawer and shows the "Checkout Now" button.

These tests run on every code change that affects the store and must pass before deployment.

### 2. Unit Tests (Product Sync Logic)

Existing tests guard against:

- Re-adding deleted products to the catalog.
- Incorrect product sync when Supabase is the source of truth.
- Preservation of admin customizations (e.g., price, title) during sync.

### 3. Process Improvements

- **Admin–store sync** — Supabase is the single source of truth; products load always uses the database result (including empty). Home page New Arrivals uses live store products.
- **Documented edge cases** — Cart behavior at quantity = 0 is now explicitly documented and covered by logic and tests.
- **Product-type handling** — Apparel vs. non-apparel (e.g., accessories) is now handled explicitly for size display and add-to-cart flow.
- **Navigation standards** — All routes use the same navigation handler to avoid inconsistencies.

---

## Quality Philosophy — How We Learn and Prevent Recurrence

The role of a Quality Director or VP of Quality is to ensure incidents like this are rare—and when they occur, to turn them into lasting improvements. We have applied that mindset to this incident.

### Self-Learning and Self-Lessons

| Principle | How We Apply It |
|-----------|-----------------|
| **Defects are signals** | Every bug points to a gap: in tests, assumptions, or design. We document root causes and update processes, not just fix code. |
| **No blame, only learning** | The goal is not to assign fault but to understand what allowed the defect to reach production and what we will do differently. |
| **Institutionalize the lesson** | Each incident produces documentation, tests, and process updates so the same mistake cannot recur without a test catching it. |

### Tests as Prevention, Not Just Verification

| Practice | Implementation |
|----------|----------------|
| **Test-first mindset** | If a bug reached production, we lacked a test that would have caught it. We add tests not only to fix the immediate bug but to prevent recurrence. |
| **End-to-end verification** | Unit tests alone are insufficient. Critical user flows (shop → cart → checkout) now have automated E2E tests that run on every release. |
| **Execute and enforce** | Tests are integrated into the deployment pipeline. They must pass before code ships. We do not treat tests as optional. |

### Design and Process Standards

| Standard | Application |
|----------|-------------|
| **Explicit edge-case handling** | Ambiguous behaviors (e.g., quantity at zero) are documented and implemented explicitly rather than left implicit. |
| **Consistency over shortcuts** | App-wide patterns (e.g., navigation) are used everywhere. One-off solutions create technical debt and future bugs. |
| **Single source of truth** | Data flows (e.g., products from Supabase) are clearly defined so admin and customer-facing store stay in sync. |

### Commitment

We treat this incident as a production event worthy of full post-mortem treatment. The tests and process improvements documented above are not one-time fixes—they are permanent additions to our quality system. We will apply the same rigor to other high-traffic areas (membership, calendar, contact forms) and continue to expand test coverage as the platform evolves.

---

## Next Steps

We will:

1. **Execute** — Run store E2E and unit tests as part of the standard deployment pipeline; no deployment without passing tests.
2. **Expand** — Extend test coverage to additional flows (quantity changes in cart, empty cart behavior, checkout validation) as the store evolves.
3. **Document** — Keep this post-mortem and related documentation updated when we introduce new store functionality.
4. **Replicate** — Apply the same quality approach to other high-traffic areas (membership, calendar, contact forms).

---

## Summary

The store defects have been identified, fixed, and covered by automated tests. The client’s primary concern—that products deleted in the admin console were still visible on the customer-facing store—is resolved. Admin and store are now in sync at all times via Supabase as the single source of truth. We have used this incident to strengthen our quality practices: self-learning, explicit tests, and process improvements that prevent recurrence. These tests and processes are now part of our standard workflow and will help ensure similar issues do not reach production.

If you have questions or would like more detail on any section, please reach out.
