# Supabase Setup Guide

This guide will help you set up Supabase for the Lord's Gym website.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: `lords-gym` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (takes ~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the project root (copy from `.env.local.example` if it exists)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

## Step 4: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run" to execute the migration
4. This will create all necessary tables and set up Row Level Security (RLS)

## Step 5: Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Create a bucket named `media` with public access enabled
4. This bucket will store uploaded images and files

## Step 6: Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Configure your authentication providers (Email, etc.)
3. Set up email templates if needed
4. Create your first admin user:
   - Go to **Authentication** > **Users**
   - Click "Add user"
   - Enter email and password
   - Set user metadata: `{ "role": "admin" }`

## Step 7: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/admin`
3. Try logging in with your admin credentials
4. Check that data loads from Supabase (not localStorage)

## Troubleshooting

### Data not loading from Supabase

- Check that environment variables are set correctly
- Verify Supabase project is active
- Check browser console for errors
- Ensure RLS policies allow read access

### Authentication not working

- Verify email provider is enabled in Supabase
- Check that user exists in Supabase Auth
- Ensure user metadata includes role field

### Storage uploads failing

- Verify `media` bucket exists and is public
- Check bucket policies allow uploads
- Ensure file size limits are appropriate

## Database Schema

The following tables are created:

- `settings` - Site-wide settings
- `home_content` - Home page content
- `products` - Store products
- `testimonials` - Customer testimonials
- `pages` - Page content management
- `media` - Media library metadata
- `calendar_events` - Calendar events/classes
- `calendar_recurring_patterns` - Recurring event patterns
- `calendar_bookings` - Member class bookings
- `instructors` - Instructor profiles

## Row Level Security (RLS)

RLS policies are configured to:
- Allow public read access to most content
- Restrict write access to authenticated admin/editor users
- Protect user data and admin functions

## Migration from localStorage

On first load with Supabase configured, the app will automatically migrate data from localStorage to Supabase. This is a one-time process.

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review error messages in browser console
3. Check Supabase project logs in dashboard
