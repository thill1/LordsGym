-- Reconcile the production outreach_content table with the admin editor.
-- The live table was created from 007_outreach_content.sql and only contains
-- photo_titles; the editor stores its six image slots in this JSONB column.
alter table public.outreach_content
  add column if not exists images jsonb not null default '{}'::jsonb;
