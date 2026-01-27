<style>
@page {
  margin-bottom: 30mm;
}
@page {
  @bottom-center {
    content: "Sentient Partners | Client Deliverable | Confidential and Proprietary | sentientpartners.ai\A © 2026 Sentient Partners";
    font-size: 9px;
    color: #666;
  }
}
</style>

# Lord's Gym Website - User Acceptance Testing (UAT) Test Plan

**Document Version:** 1.0  
**Date:** January 27, 2026  
**Purpose:** Comprehensive test plan for client User Acceptance Testing  
**Environment:** Staging/Production

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Environment](#2-test-environment)
3. [Test Cases - Public Website](#3-test-cases---public-website)
4. [Test Cases - Admin Dashboard](#4-test-cases---admin-dashboard)
5. [Test Cases - Integrations](#5-test-cases---integrations)
6. [Test Cases - Performance & Security](#6-test-cases---performance--security)
7. [UAT Feedback Form](#7-uat-feedback-form)
8. [Sign-Off Form](#8-sign-off-form)

---

## 1. Introduction

### 1.1 Purpose

This User Acceptance Testing (UAT) plan provides a comprehensive testing framework to ensure the Lord's Gym website meets all requirements and functions correctly before production launch.

### 1.2 Scope

This test plan covers:
- All public-facing pages and features
- Complete admin dashboard functionality
- Third-party integrations (Go High Level, Shopify)
- Performance and security requirements
- Accessibility compliance

### 1.3 Test Objectives

- Verify all features work as specified
- Ensure user experience meets expectations
- Validate integrations function correctly
- Confirm performance requirements are met
- Validate security measures are in place

### 1.4 Acceptance Criteria

**Website is considered ready for launch when:**
- ✅ All critical test cases pass
- ✅ All high-priority issues are resolved
- ✅ Client sign-off obtained
- ✅ Documentation complete

---

## 2. Test Environment

### 2.1 Test URLs

**Staging Environment:**
- URL: [To be provided]
- Admin URL: [To be provided]

**Production Environment:**
- URL: [To be provided]
- Admin URL: [To be provided]

### 2.2 Test Credentials

**Admin Access:**
- Email: [To be provided]
- Password: [To be provided]

**Test User Accounts:**
- [To be provided]

### 2.3 Test Data

**Test Products:**
- [List of test products]

**Test Events:**
- [List of test calendar events]

**Test Contacts:**
- [List of test contact information]

### 2.4 Browser Requirements

Test on the following browsers:
- ✅ Chrome (latest version)
- ✅ Firefox (latest version)
- ✅ Safari (latest version)
- ✅ Edge (latest version)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### 2.5 Device Requirements

Test on the following devices:
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (iPad, Android tablet)
- ✅ Mobile (iPhone, Android phone)

---

## 3. Test Cases - Public Website

### Test Case 1.1: Home Page Display

**Objective:** Verify home page displays correctly with all elements

**Steps:**
1. Navigate to home page
2. Verify hero section displays
3. Verify values section displays
4. Verify featured products display
5. Verify navigation menu displays
6. Verify footer displays

**Expected Results:**
- Hero section shows headline, subheadline, CTA button, and background image
- Values section shows three stats with labels
- Featured products display in grid layout
- Navigation menu is functional
- Footer displays contact information

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.2: Home Page Dark Mode

**Objective:** Verify dark mode toggle works on home page

**Steps:**
1. Navigate to home page
2. Click dark mode toggle
3. Verify page switches to dark mode
4. Click toggle again
5. Verify page switches back to light mode

**Expected Results:**
- Dark mode applies correctly
- All text remains readable
- Images display correctly
- Toggle persists across page navigation

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.3: Membership Page Display

**Objective:** Verify membership page displays all tiers correctly

**Steps:**
1. Navigate to Membership page
2. Verify all three membership tiers display
3. Verify pricing information is correct
4. Verify "Join Now" buttons display
5. Verify FAQ section displays

**Expected Results:**
- Regular Monthly ($39/month) displays
- Student Monthly ($29/month) displays
- Annual ($360/year) displays
- Setup fee ($39) mentioned
- FAQ section shows all questions

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.4: Membership Purchase Flow

**Objective:** Verify membership can be added to cart and checkout initiated

**Steps:**
1. Navigate to Membership page
2. Click "Join Now" on Regular Monthly
3. Verify cart drawer opens
4. Verify membership and setup fee added
5. Click checkout
6. Verify redirect to checkout page

**Expected Results:**
- Cart drawer opens automatically
- Membership ($39) added to cart
- Setup fee ($39) added to cart
- Total shows $78
- Checkout redirects correctly

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.5: Shop Page Product Display

**Objective:** Verify shop page displays products correctly

**Steps:**
1. Navigate to Shop page
2. Verify product grid displays
3. Verify product images load
4. Verify product titles display
5. Verify prices display
6. Verify category filter works

**Expected Results:**
- All products display in grid
- Images load correctly
- Product information accurate
- Category filter filters products correctly
- "All Products" shows all products

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.6: Shopping Cart Functionality

**Objective:** Verify shopping cart works correctly

**Steps:**
1. Navigate to Shop page
2. Add product to cart
3. Verify cart drawer opens
4. Verify product appears in cart
5. Change quantity
6. Remove product
7. Verify cart updates

**Expected Results:**
- Cart drawer opens on add
- Product displays with image, title, price
- Quantity can be increased/decreased
- Product can be removed
- Cart total updates correctly
- Cart persists across pages

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.7: Checkout Process

**Objective:** Verify checkout process works end-to-end

**Steps:**
1. Add product to cart
2. Navigate to checkout page
3. Fill in contact information
4. Fill in billing address
5. Fill in payment details
6. Submit order

**Expected Results:**
- Checkout page loads
- Form fields accept input
- Validation works (required fields)
- Order summary displays correctly
- Submit button processes order
- Redirects to confirmation page

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.8: Calendar Month View

**Objective:** Verify calendar month view displays correctly

**Steps:**
1. Navigate to Calendar page
2. Verify month view displays
3. Verify events appear on correct dates
4. Click on event
5. Verify event modal opens

**Expected Results:**
- Calendar grid displays current month
- Events appear on correct dates
- Event titles visible
- Clicking event opens modal
- Modal shows event details

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.9: Calendar View Switching

**Objective:** Verify calendar view switching works

**Steps:**
1. Navigate to Calendar page
2. Click "Week" view button
3. Verify week view displays
4. Click "Day" view button
5. Verify day view displays
6. Click "List" view button
7. Verify list view displays
8. Click "Month" view button
9. Verify month view displays

**Expected Results:**
- Each view switches correctly
- Events display appropriately in each view
- Navigation controls work
- Current date highlighted

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.10: Calendar Event Booking

**Objective:** Verify event booking works (requires login)

**Steps:**
1. Navigate to Calendar page
2. Click on event
3. Click "Book Class" button
4. Login if prompted
5. Fill booking form
6. Submit booking

**Expected Results:**
- Booking button appears for logged-in users
- Booking form displays
- Form submission works
- Booking confirmation displays
- Booking appears in user's bookings

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.11: Calendar Export

**Objective:** Verify calendar export functionality

**Steps:**
1. Navigate to Calendar page
2. Click "Export Calendar" button
3. Verify .ics file downloads
4. Open file in calendar application
5. Verify events import correctly

**Expected Results:**
- Export button works
- .ics file downloads
- File opens in calendar apps
- Events import with correct details
- Dates and times correct

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.12: Contact Form Submission

**Objective:** Verify contact form submits to Go High Level

**Steps:**
1. Navigate to Contact page
2. Fill in contact form:
   - Select inquiry type
   - Enter first name
   - Enter last name
   - Enter email
   - Enter phone (optional)
   - Enter message
3. Click "Send Message"
4. Verify submission success

**Expected Results:**
- Form fields accept input
- Validation works (required fields)
- Submission succeeds
- Success message displays
- Contact created in Go High Level
- Confirmation email sent (if configured)

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.13: Contact Form Validation

**Objective:** Verify form validation works correctly

**Steps:**
1. Navigate to Contact page
2. Try to submit empty form
3. Verify validation errors display
4. Fill in partial information
5. Verify specific field errors

**Expected Results:**
- Empty form shows validation errors
- Required field indicators visible
- Email format validation works
- Phone format validation works
- Error messages clear and helpful

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 1.14: Mobile Responsiveness

**Objective:** Verify website is mobile-responsive

**Steps:**
1. Open website on mobile device (or resize browser)
2. Navigate through all pages
3. Verify layout adapts correctly
4. Verify navigation menu works
5. Verify forms are usable
6. Verify images scale correctly

**Expected Results:**
- Layout adapts to mobile screen
- Navigation menu becomes hamburger menu
- Text remains readable
- Buttons are touch-friendly (44x44px minimum)
- Forms are easy to fill
- No horizontal scrolling

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

## 4. Test Cases - Admin Dashboard

### Test Case 2.1: Admin Login

**Objective:** Verify admin login works correctly

**Steps:**
1. Navigate to /admin
2. Enter valid email and password
3. Click "Login"
4. Verify dashboard loads

**Expected Results:**
- Login page displays
- Valid credentials log in successfully
- Dashboard loads after login
- User email displays in header

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.2: Admin Login - Invalid Credentials

**Objective:** Verify invalid credentials are rejected

**Steps:**
1. Navigate to /admin
2. Enter invalid email or password
3. Click "Login"
4. Verify error message displays

**Expected Results:**
- Error message displays
- User remains on login page
- No dashboard access granted

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.3: Admin Dashboard Overview

**Objective:** Verify dashboard displays key metrics

**Steps:**
1. Login to admin dashboard
2. Verify dashboard overview displays
3. Check metrics cards
4. Verify activity feed displays
5. Verify quick access links work

**Expected Results:**
- Dashboard loads correctly
- Metrics display (products, pages, events)
- Activity feed shows recent actions
- Quick access links navigate correctly

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.4: Home Content Editor

**Objective:** Verify home content can be edited

**Steps:**
1. Login to admin dashboard
2. Navigate to "Home Content"
3. Edit hero headline
4. Edit hero subheadline
5. Change CTA text
6. Upload new background image
7. Save changes
8. Verify changes on home page

**Expected Results:**
- Editor loads current content
- Changes save successfully
- Changes appear on home page immediately
- Image uploads work
- Validation prevents invalid data

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.5: Page Creation

**Objective:** Verify new pages can be created

**Steps:**
1. Login to admin dashboard
2. Navigate to "Pages"
3. Click "Create New Page"
4. Enter page title
5. Enter page slug
6. Add content using rich text editor
7. Set SEO metadata
8. Publish page
9. Verify page appears on website

**Expected Results:**
- Page creation form loads
- All fields accept input
- Rich text editor works
- SEO fields save
- Page publishes successfully
- Page accessible at /[slug]

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.6: Page Editing

**Objective:** Verify existing pages can be edited

**Steps:**
1. Login to admin dashboard
2. Navigate to "Pages"
3. Click on existing page
4. Edit content
5. Save changes
6. Verify changes appear on website

**Expected Results:**
- Page editor loads existing content
- Changes save successfully
- Changes appear on website
- Version history created

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.7: Media Library Upload

**Objective:** Verify images can be uploaded to media library

**Steps:**
1. Login to admin dashboard
2. Navigate to "Media Library"
3. Click "Upload"
4. Select image file
5. Verify upload progress
6. Verify image appears in library
7. Add alt text
8. Verify image metadata saves

**Expected Results:**
- Upload interface works
- File uploads successfully
- Progress indicator shows
- Image appears in library
- Alt text saves
- Image URL generated

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.8: Product Management

**Objective:** Verify products can be created and managed

**Steps:**
1. Login to admin dashboard
2. Navigate to "Store"
3. Click "Add Product"
4. Enter product details:
   - Title
   - Price
   - Category
   - Description
   - Image
   - Inventory
5. Save product
6. Verify product appears in shop

**Expected Results:**
- Product creation form works
- All fields save correctly
- Product appears in shop
- Inventory tracking works
- Categories assign correctly

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.9: Calendar Event Creation

**Objective:** Verify calendar events can be created

**Steps:**
1. Login to admin dashboard
2. Navigate to "Calendar"
3. Click "Create Event"
4. Enter event details:
   - Title
   - Description
   - Start time
   - End time
   - Instructor
   - Class type
   - Capacity
5. Save event
6. Verify event appears on calendar

**Expected Results:**
- Event creation form works
- Date/time picker works
- Instructor selection works
- Event saves successfully
- Event appears on public calendar
- Recurring events option works

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 2.10: Settings Management

**Objective:** Verify site settings can be updated

**Steps:**
1. Login to admin dashboard
2. Navigate to "Settings"
3. Update site name
4. Update contact email
5. Update contact phone
6. Update address
7. Configure Google Analytics ID
8. Save settings
9. Verify changes appear on website

**Expected Results:**
- Settings form loads current values
- Changes save successfully
- Contact information updates on website
- Google Analytics code added
- Announcement bar configurable

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

## 5. Test Cases - Integrations

### Test Case 3.1: Go High Level Contact Form Integration

**Objective:** Verify contact form creates GHL contact

**Steps:**
1. Navigate to Contact page
2. Fill out contact form
3. Submit form
4. Login to Go High Level
5. Verify contact created
6. Verify contact fields mapped correctly

**Expected Results:**
- Form submission succeeds
- Contact appears in GHL CRM
- All fields mapped correctly
- Pipeline automation triggers (if configured)
- Auto-responder sends (if configured)

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 3.2: Go High Level Calendar Integration

**Objective:** Verify calendar bookings create GHL appointments

**Steps:**
1. Login to website
2. Navigate to Calendar
3. Book a class
4. Login to Go High Level
5. Verify appointment created
6. Verify appointment details correct

**Expected Results:**
- Booking succeeds on website
- Appointment created in GHL
- Event details mapped correctly
- Instructor assigned correctly
- Time slots correct

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 3.3: Shopify Integration

**Objective:** Verify Shopify store integration works

**Steps:**
1. Navigate to Shop page
2. Verify products display
3. Click product link (if Shopify products)
4. Verify Shopify storefront loads
5. Verify checkout process works

**Expected Results:**
- Shopify products accessible
- Storefront loads correctly
- Checkout process works
- Order processing works

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

## 6. Test Cases - Performance & Security

### Test Case 4.1: Page Load Performance

**Objective:** Verify pages load within acceptable time

**Steps:**
1. Clear browser cache
2. Navigate to home page
3. Measure load time
4. Repeat for all major pages
5. Verify load times acceptable

**Expected Results:**
- Home page loads in <3 seconds
- All pages load in <3 seconds
- Images load progressively
- No blocking resources

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 4.2: SSL Certificate

**Objective:** Verify SSL certificate is valid

**Steps:**
1. Navigate to website
2. Verify HTTPS in URL
3. Click padlock icon
4. Verify certificate details
5. Check certificate expiration

**Expected Results:**
- HTTPS enforced
- Valid SSL certificate
- Certificate not expired
- No security warnings

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 4.3: Admin Route Protection

**Objective:** Verify admin routes are protected

**Steps:**
1. Logout from admin
2. Try to access /admin directly
3. Verify redirect to login
4. Try to access admin API endpoints
5. Verify authentication required

**Expected Results:**
- Unauthenticated users redirected
- Admin routes protected
- API endpoints require auth
- No unauthorized access possible

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 4.4: Form Security

**Objective:** Verify forms have security measures

**Steps:**
1. Navigate to contact form
2. Try XSS injection in form fields
3. Try SQL injection
4. Submit form
5. Verify attacks blocked

**Expected Results:**
- XSS attempts sanitized
- SQL injection prevented
- Form validation works
- Server-side validation active

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 4.5: Accessibility - Keyboard Navigation

**Objective:** Verify keyboard navigation works

**Steps:**
1. Navigate to website
2. Use Tab key to navigate
3. Verify focus indicators visible
4. Verify all interactive elements accessible
5. Verify forms navigable by keyboard

**Expected Results:**
- Tab navigation works
- Focus indicators visible
- All links/buttons accessible
- Forms navigable
- Skip links work (if present)

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

### Test Case 4.6: Accessibility - Screen Reader

**Objective:** Verify screen reader compatibility

**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through website
3. Verify content read correctly
4. Verify images have alt text
5. Verify forms have labels

**Expected Results:**
- Content read correctly
- Images have descriptive alt text
- Forms have proper labels
- Navigation announced correctly
- Headings structured properly

**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** _________________________________

---

## 7. UAT Feedback Form

**Test Case ID:** _______________  
**Test Case Name:** _______________  
**Date:** _______________  
**Tester Name:** _______________  

**Status:**
- ☐ Pass
- ☐ Fail
- ☐ Blocked
- ☐ Not Tested

**Priority (if failed):**
- ☐ Critical (Blocks launch)
- ☐ High (Major functionality)
- ☐ Medium (Minor issue)
- ☐ Low (Cosmetic)

**Description of Issue:**
_________________________________
_________________________________
_________________________________

**Steps to Reproduce:**
1. _________________________________
2. _________________________________
3. _________________________________

**Expected Result:**
_________________________________

**Actual Result:**
_________________________________

**Screenshots/Videos:**
[Attach if applicable]

**Additional Notes:**
_________________________________
_________________________________

---

## 8. Sign-Off Form

### Test Execution Summary

**Total Test Cases:** _______  
**Passed:** _______  
**Failed:** _______  
**Blocked:** _______  
**Not Tested:** _______  

**Pass Rate:** _______%

### Issues Summary

**Critical Issues:** _______  
**High Priority Issues:** _______  
**Medium Priority Issues:** _______  
**Low Priority Issues:** _______  

### Client Approval

**I have reviewed and tested the Lord's Gym website according to this test plan.**

**Overall Assessment:**
- ☐ Approved for Launch
- ☐ Approved with Minor Issues (to be fixed post-launch)
- ☐ Not Approved - Major Issues Must Be Resolved

**Client Name:** _______________________  
**Title:** _______________________  
**Date:** _______________________  
**Signature:** _______________________  

### Development Team Sign-Off

**Project Manager:** _______________________ Date: _______  
**Lead Developer:** _______________________ Date: _______  
**QA Lead:** _______________________ Date: _______  

---

**End of UAT Test Plan**
