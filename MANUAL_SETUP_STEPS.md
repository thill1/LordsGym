# Manual Supabase Setup Steps

Since browser automation requires authentication, follow these steps manually in your Chrome browser (where you're already logged in).

## ✅ Step 1: Run Database Migration

1. **Open SQL Editor**
   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/sql/new
   - Or navigate: Dashboard → SQL Editor → New Query

2. **Copy Migration SQL**
   - Open the file: `supabase/migrations/003_complete_schema.sql`
   - Select all (Ctrl+A) and copy (Ctrl+C)

3. **Paste and Run**
   - Paste into the SQL Editor
   - Click **Run** button (or press Ctrl+Enter)
   - Wait for completion - you should see "Success. No rows returned"

4. **Verify**
   - Go to: Dashboard → Table Editor
   - You should see 14 tables created:
     - settings
     - home_content
     - products
     - testimonials
     - pages
     - media
     - instructors
     - calendar_events
     - calendar_recurring_patterns
     - calendar_recurring_exceptions
     - calendar_bookings
     - page_versions
     - activity_logs
     - seo_settings
     - schema_markup

---

## ✅ Step 2: Create Storage Bucket

1. **Navigate to Storage**
   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets
   - Or navigate: Dashboard → Storage → Buckets

2. **Create New Bucket**
   - Click **New bucket** button
   - **Name**: `media`
   - **Public bucket**: ✅ Check this box (important!)
   - **File size limit**: Leave default or set to 50MB
   - **Allowed MIME types**: Leave empty (allows all types)
   - Click **Create bucket**

3. **Verify**
   - You should see the `media` bucket in the list
   - It should show as "Public"

---

## ✅ Step 3: Create Admin User

1. **Navigate to Authentication**
   - Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users
   - Or navigate: Dashboard → Authentication → Users

2. **Add New User**
   - Click **Add user** button
   - Select **Create new user**

3. **Enter User Details**
   - **Email**: Enter your admin email (e.g., `admin@lordsgym.com`)
   - **Password**: Enter a strong password
   - **Auto Confirm User**: ✅ Check this (so you can log in immediately)

4. **Add Role Metadata**
   - Click **Advanced** to expand metadata section
   - In the **Raw App Meta Data** field, enter:
     ```json
     {"role": "admin"}
     ```
   - Click **Create user**

5. **Verify**
   - User should appear in the users list
   - Check that the user has the metadata: `{"role": "admin"}`

---

## ✅ Step 4: Verify Setup

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Admin Login**
   - Navigate to: http://localhost:5173/admin
   - Log in with the admin user you created
   - You should be able to access the admin panel

3. **Verify Data Loading**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh the page
   - You should see requests to `*.supabase.co` API endpoints
   - Data should load from Supabase (not localStorage)

4. **Check Console**
   - Look for any errors in the browser console
   - Should see successful Supabase API calls

---

## 🎉 Setup Complete!

Your Supabase database is now set up with:
- ✅ 14 database tables
- ✅ Row Level Security policies
- ✅ Storage bucket for media
- ✅ Admin user account
- ✅ Default data (settings, home content, SEO settings)

## 📝 Next Steps

1. **Populate Initial Data**
   - Add products through the admin panel
   - Add testimonials
   - Create pages

2. **Configure SEO**
   - Set up default meta tags
   - Add schema markup

3. **Set Up Calendar**
   - Add instructors
   - Create recurring event patterns
   - Add calendar events

4. **Test Features**
   - Test product management
   - Test calendar bookings
   - Test media uploads

---

## 🆘 Troubleshooting

**Migration failed?**
- Check SQL Editor for error messages
- Ensure you copied the entire file
- Try running sections separately if needed

**Can't create bucket?**
- Verify you're logged in
- Check project is active
- Try refreshing the page

**Can't log in to admin?**
- Verify user was created successfully
- Check user has `{"role": "admin"}` metadata
- Try resetting password if needed

**Data not loading?**
- Check `.env.local` has correct values
- Verify Supabase project is active
- Check browser console for errors
- Ensure RLS policies allow read access

---

## 📚 Reference

- **Project Dashboard**: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb
- **SQL Editor**: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/sql/new
- **Storage**: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets
- **Auth Users**: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users
