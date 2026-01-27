-- Add popup_modals to settings for admin-controlled, page-specific popups
-- Run this after 003_complete_schema.sql (or after your existing settings table exists)

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS popup_modals JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Ensure existing default row has empty array if column was just added
UPDATE settings
SET popup_modals = COALESCE(popup_modals, '[]'::jsonb)
WHERE id = 'default' AND (popup_modals IS NULL OR popup_modals = 'null'::jsonb);
