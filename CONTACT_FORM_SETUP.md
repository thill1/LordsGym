# Contact Form Setup: Supabase + Email

The contact form saves submissions to Supabase and sends email notifications to lordsgymoutreach@gmail.com.

## Quick setup (after `supabase login`)

```bash
# 1. Run migration
npx supabase db push --project-ref mrptukahxloqpdqiaxkb

# 2. Deploy Edge Function
npx supabase functions deploy contact-form --project-ref mrptukahxloqpdqiaxkb

# 3. Set Resend key (get from resend.com)
npx supabase secrets set RESEND_API_KEY=re_your_key --project-ref mrptukahxloqpdqiaxkb
```

## Manual: Run the migration

In [Supabase SQL Editor](https://supabase.com/dashboard/project/mrptukahxloqpdqiaxkb/sql/new), run:

```sql
-- From supabase/migrations/20250209_contact_submissions.sql
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON contact_submissions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can read contact submissions" ON contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions (created_at DESC);
```

Or run locally: `supabase db push`

## 2. Deploy the Edge Function

```bash
supabase functions deploy contact-form
```

## 3. Set Resend API key (for email notifications)

1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Get your API key from the dashboard
3. Set in Supabase:

```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
```

**Note:** Resend uses `onboarding@resend.dev` as the sender by default (no domain verification for testing). For production, verify your domain in Resend and update the `from` address in `supabase/functions/contact-form/index.ts`.

## 4. Verify

- Form submissions appear in `contact_submissions` table
- Emails arrive at lordsgymoutreach@gmail.com with subject = inquiry type and body = form data

## Viewing submissions

Admins can query the table in Supabase, or you can add a Contact Submissions view in the Admin dashboard later.
