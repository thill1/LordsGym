# Database Schema Documentation

This document describes the complete database schema for Lord's Gym website.

## Schema Overview

The database is designed to be lightweight and easily migratable to Go High Level in the future. All tables use PostgreSQL with JSONB for flexible content storage.

## Table Reference

### Core Content Tables

#### `settings`
Site-wide configuration and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (always 'default') |
| site_name | TEXT | Name of the site |
| contact_email | TEXT | Contact email address |
| contact_phone | TEXT | Contact phone number |
| address | TEXT | Physical address |
| google_analytics_id | TEXT | Google Analytics tracking ID |
| announcement_bar | JSONB | Announcement bar configuration |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS**: Public read, authenticated write

---

#### `home_content`
Home page content (hero section and values).

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (always 'default') |
| hero | JSONB | Hero section content (headline, subheadline, CTA, background) |
| values | JSONB | Values section (stats and labels) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS**: Public read, authenticated write

---

#### `products`
Store products/merchandise.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (product ID) |
| title | TEXT | Product name |
| price | DECIMAL(10,2) | Product price |
| category | TEXT | Product category |
| image | TEXT | Product image URL |
| description | TEXT | Product description |
| inventory | JSONB | Inventory tracking (by size/variant) |
| variants | JSONB | Product variants (sizes, colors, etc.) |
| featured | BOOLEAN | Whether product is featured |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes**: `category`, `featured`

**RLS**: Public read, authenticated write

---

#### `testimonials`
Customer testimonials.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | TEXT | Customer name |
| role | TEXT | Customer role/title |
| quote | TEXT | Testimonial text |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS**: Public read, authenticated write

---

#### `pages`
CMS pages with content and SEO metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | URL slug (unique) |
| title | TEXT | Page title |
| content | JSONB | Page content (structured) |
| meta_title | TEXT | SEO meta title |
| meta_description | TEXT | SEO meta description |
| meta_image | TEXT | Open Graph image URL |
| published | BOOLEAN | Publication status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes**: `slug`, `published`

**RLS**: Public read (published only), authenticated write

---

### Media & Assets

#### `media`
Media library metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| filename | TEXT | Original filename |
| url | TEXT | File URL (Supabase Storage) |
| file_type | TEXT | MIME type |
| file_size | BIGINT | File size in bytes |
| folder | TEXT | Folder/organization |
| tags | TEXT[] | Tags for organization |
| alt_text | TEXT | Alt text for accessibility |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS**: Public read, authenticated write

---

### Calendar & Bookings

#### `instructors`
Instructor profiles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Instructor name |
| email | TEXT | Email address |
| bio | TEXT | Biography |
| image_url | TEXT | Profile image URL |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS**: Public read, authenticated write

---

#### `calendar_recurring_patterns`
Recurring event patterns.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pattern_type | TEXT | 'daily', 'weekly', 'monthly' |
| interval | INTEGER | Interval (e.g., every 2 weeks = 2) |
| days_of_week | INTEGER[] | Days of week [1-7] for weekly patterns |
| end_date | TIMESTAMPTZ | Optional end date |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS**: Authenticated only

---

#### `calendar_events`
Calendar events/classes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Event title |
| description | TEXT | Event description |
| start_time | TIMESTAMPTZ | Start time |
| end_time | TIMESTAMPTZ | End time |
| instructor_id | UUID | Foreign key to instructors |
| class_type | TEXT | 'strength', 'cardio', 'recovery', 'community' |
| capacity | INTEGER | Maximum attendees |
| recurring_pattern_id | UUID | Foreign key to recurring_patterns |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes**: `start_time`, `class_type`

**RLS**: Public read, authenticated write

---

#### `calendar_recurring_exceptions`
Exceptions to recurring patterns (skip specific dates).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| recurring_pattern_id | UUID | Foreign key to recurring_patterns |
| exception_date | DATE | Date to skip |
| reason | TEXT | Reason for exception |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Indexes**: `recurring_pattern_id`, `exception_date`

**RLS**: Authenticated only

---

#### `calendar_bookings`
Member class bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Foreign key to calendar_events |
| user_id | UUID | Foreign key to auth.users |
| status | TEXT | 'confirmed', 'cancelled', 'waitlist' |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes**: `event_id`, `user_id`

**Unique Constraint**: `(event_id, user_id)` - one booking per user per event

**RLS**: Users can see/update/delete their own bookings, authenticated can create

---

### Admin Features

#### `page_versions`
Version history for pages (enables rollback).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| page_id | UUID | Foreign key to pages |
| content | JSONB | Page content snapshot |
| meta_title | TEXT | Meta title snapshot |
| meta_description | TEXT | Meta description snapshot |
| meta_image | TEXT | Meta image snapshot |
| created_by | UUID | Foreign key to auth.users |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Indexes**: `page_id`, `created_at`

**RLS**: Authenticated only

---

#### `activity_logs`
Admin action audit log.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| action_type | TEXT | 'create', 'update', 'delete', 'login', 'logout' |
| entity_type | TEXT | 'product', 'page', 'event', 'user', etc. |
| entity_id | TEXT | ID of affected entity |
| description | TEXT | Human-readable description |
| metadata | JSONB | Additional context |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Indexes**: `user_id`, `created_at`, `entity_type`

**RLS**: Authenticated read/write

---

### SEO & Schema

#### `seo_settings`
Site-wide SEO defaults.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (always 'default') |
| default_meta_title | TEXT | Default meta title |
| default_meta_description | TEXT | Default meta description |
| default_og_image | TEXT | Default Open Graph image |
| twitter_handle | TEXT | Twitter handle |
| facebook_app_id | TEXT | Facebook App ID |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS**: Public read, authenticated write

---

#### `schema_markup`
Schema.org JSON-LD markup.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| page_slug | TEXT | Page slug (NULL for site-wide) |
| schema_type | TEXT | 'Organization', 'LocalBusiness', 'Event', 'Product', 'Article' |
| schema_json | JSONB | Schema.org JSON-LD |
| is_active | BOOLEAN | Whether to include in page |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes**: `page_slug`, `is_active`

**Unique Constraint**: `(page_slug, schema_type)` - one schema type per page

**RLS**: Public read (active only), authenticated write

---

## Relationships

```
instructors (1) ──< (many) calendar_events
calendar_recurring_patterns (1) ──< (many) calendar_events
calendar_recurring_patterns (1) ──< (many) calendar_recurring_exceptions
calendar_events (1) ──< (many) calendar_bookings
auth.users (1) ──< (many) calendar_bookings
pages (1) ──< (many) page_versions
auth.users (1) ──< (many) page_versions
auth.users (1) ──< (many) activity_logs
```

## Indexes

All foreign keys and frequently queried columns are indexed for performance:
- Product category and featured status
- Calendar event start time and class type
- Booking event and user IDs
- Page slug and published status
- Activity log user, date, and entity type
- Version history page ID and date
- Schema markup page slug and active status

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow public read access to content (products, pages, events)
- Restrict write access to authenticated users
- Protect user-specific data (bookings)
- Enable admin-only features (versions, activity logs)

## Automatic Features

### Timestamps
All tables with `updated_at` columns have triggers that automatically update the timestamp on row updates.

### Default Data
The migration includes default data for:
- Settings (site name, contact info)
- Home content (hero and values)
- SEO settings (default meta tags)

## Migration Considerations

This schema is designed to be easily migratable to Go High Level:

1. **Simple Structure**: Most tables map directly to common data structures
2. **JSONB Flexibility**: JSONB columns allow flexible content without schema changes
3. **Standard Types**: Uses standard PostgreSQL types that translate well
4. **Minimal Dependencies**: No complex PostgreSQL-specific features
5. **Clear Relationships**: Simple foreign key relationships

When migrating:
- Export data using SQL queries or Supabase CLI
- Map tables to Go High Level data structures
- Update API calls in codebase
- Migrate authentication separately
- Handle file storage migration separately
