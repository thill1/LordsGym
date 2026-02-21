-- Add image_coming_soon column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_coming_soon BOOLEAN DEFAULT false;
