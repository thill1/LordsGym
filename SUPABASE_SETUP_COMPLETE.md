# Supabase Setup Guide - Complete Schema

This guide will help you set up Supabase for the Lord's Gym website with the complete database schema.

## Project Information

- **Supabase Project**: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb
- **Project Reference ID**: `mrptukahxloqpdqiaxkb`

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://mrptukahxloqpdqiaxkb.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the project root (or copy from `env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://mrptukahxloqpdqiaxkb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

## Step 3: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/migrations/003_complete_schema.sql`
4. Click **Run** (or press Ctrl+Enter) to execute the migration
5. Verify success - you should see "Success. No rows returned"

This migration will create:
- ✅ All core content tables (settings, home_content, products, testimonials, pages)
- ✅ Media and asset management tables
- ✅ Calendar and booking system tables
- ✅ Admin features (version history, activity logs)
- ✅ SEO and schema markup tables
- ✅ All indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp triggers
- ✅ Default data

## Step 4: Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Create a bucket named `media` with:
   - **Public bucket**: ✅ Enabled
   - **File size limit**: 50MB (or your preference)
   - **Allowed MIME types**: Leave empty for all types
4. Click **Create bucket**

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Configure your authentication providers:
   - **Email**: Enable email/password authentication
   - **Email confirmations**: Optional (disable for easier testing)
3. Create your first admin user:
   - Go to **Authentication** > **Users**
   - Click **Add user** > **Create new user**
   - Enter email and password
   - Set user metadata (click **Advanced**):
     ```json
     {
       "role": "admin"
     }
     ```
   - Click **Create user**

## Step 6: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin` in your browser

3. Try logging in with your admin credentials

4. Check browser console for any errors

5. Verify data loads from Supabase (not localStorage):
   - Check Network tab - should see requests to Supabase API
   - Data should persist after page refresh

## Database Schema Overview

### Core Content Tables
- **settings** - Site-wide configuration (name, contact info, announcement bar)
- **home_content** - Home page hero and values sections
- **products** - Store products with inventory and variants
- **testimonials** - Customer testimonials
- **pages** - CMS pages with content and SEO metadata

### Media & Assets
- **media** - Media library metadata (images, files)

### Calendar & Bookings
- **instructors** - Instructor profiles
- **calendar_events** - Calendar events/classes
- **calendar_recurring_patterns** - Recurring event patterns
- **calendar_recurring_exceptions** - Exceptions to recurring patterns
- **calendar_bookings** - Member class bookings

### Admin Features
- **page_versions** - Version history for pages
- **activity_logs** - Admin action audit log

### SEO & Schema
- **seo_settings** - Site-wide SEO defaults
- **schema_markup** - Schema.org JSON-LD markup

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Public Read Access**: Most content tables allow public read (settings, products, pages, etc.)
- **Authenticated Write**: Only authenticated users can create/update/delete
- **User-Specific**: Bookings are restricted to the user who created them
- **Published Content**: Pages require `published = true` for public access

## Migration from localStorage

The app automatically migrates data from localStorage to Supabase on first load when Supabase is configured. This is a one-time process.

## Troubleshooting

### Data not loading from Supabase
- ✅ Check that environment variables are set correctly in `.env.local`
- ✅ Verify Supabase project is active
- ✅ Check browser console for errors
- ✅ Ensure RLS policies allow read access
- ✅ Verify migration ran successfully (check Tables in Supabase dashboard)

### Authentication not working
- ✅ Verify email provider is enabled in Supabase Auth settings
- ✅ Check that user exists in Supabase Auth > Users
- ✅ Ensure user metadata includes `role` field
- ✅ Check browser console for auth errors

### Storage uploads failing
- ✅ Verify `media` bucket exists and is public
- ✅ Check bucket policies allow uploads
- ✅ Ensure file size limits are appropriate
- ✅ Check CORS settings if uploading from browser

### Migration errors
- ✅ If tables already exist, the migration uses `CREATE TABLE IF NOT EXISTS` so it's safe to run again
- ✅ If policies already exist, the migration uses `DROP POLICY IF EXISTS` before creating new ones
- ✅ Check SQL Editor for specific error messages

## Next Steps

1. **Populate initial data**: Add products, testimonials, and pages through the admin panel
2. **Configure SEO**: Set up default meta tags and schema markup
3. **Set up calendar**: Create instructors and recurring event patterns
4. **Test bookings**: Create test events and verify booking flow
5. **Review RLS policies**: Adjust if needed for your specific use case

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review error messages in browser console
3. Check Supabase project logs in dashboard
4. Verify all migrations ran successfully

## Future Migration to Go High Level

When migrating to Go High Level, you'll need to:
1. Export all data from Supabase (use SQL queries or Supabase CLI)
2. Map Supabase tables to Go High Level data structures
3. Update API calls in the codebase to use Go High Level endpoints
4. Migrate authentication to Go High Level auth system
5. Set up file storage in Go High Level (if different from Supabase Storage)

The schema is designed to be lightweight and easily migratable to other platforms.
