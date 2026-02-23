-- Add coming_soon_image column to products (optional custom image when image_coming_soon is true)
ALTER TABLE products ADD COLUMN IF NOT EXISTS coming_soon_image TEXT;
