# Quick Start: Supabase Setup

## 🚀 Quick Setup (5 minutes)

### 1. Get Your API Keys
1. Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/settings/api
2. Copy:
   - **Project URL**: `https://mrptukahxloqpdqiaxkb.supabase.co`
   - **anon key**: (starts with `eyJ...`)

### 2. Create `.env.local` File
```bash
# In project root
cp env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://mrptukahxloqpdqiaxkb.supabase.co
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

### 3. Run Database Migration
1. Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/sql/new
2. Open `supabase/migrations/003_complete_schema.sql`
3. Copy entire file contents
4. Paste into SQL Editor
5. Click **Run** (or Ctrl+Enter)

### 4. Create Storage Bucket
1. Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/storage/buckets
2. Click **New bucket**
3. Name: `media`
4. Check **Public bucket**
5. Click **Create bucket**

### 5. Create Admin User
1. Go to: https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/auth/users
2. Click **Add user** > **Create new user**
3. Enter email and password
4. Click **Advanced** and add metadata:
   ```json
   {"role": "admin"}
   ```
5. Click **Create user**

### 6. Test It!
```bash
npm run dev
```

Navigate to `/admin` and log in!

## ✅ Verification Checklist

- [ ] `.env.local` file exists with correct values
- [ ] Migration ran successfully (check Tables in Supabase dashboard)
- [ ] `media` bucket created and is public
- [ ] Admin user created with role metadata
- [ ] Can log in at `/admin`
- [ ] Data persists after page refresh

## 📚 Full Documentation

- **Complete Setup Guide**: `SUPABASE_SETUP_COMPLETE.md`
- **Schema Documentation**: `DATABASE_SCHEMA_DOCUMENTATION.md`
- **Original Setup Guide**: `SUPABASE_SETUP.md`

## 🆘 Troubleshooting

**Can't log in?**
- Check user exists in Supabase Auth > Users
- Verify user has `{"role": "admin"}` metadata

**Data not loading?**
- Check `.env.local` has correct values
- Verify migration ran successfully
- Check browser console for errors

**Storage uploads failing?**
- Verify `media` bucket exists and is public
- Check file size limits
