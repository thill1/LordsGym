-- Fix w1 and a1 product image URLs to ensure they use correct unsplash images
-- This clears any stale base64 data or old placeholder images that may have been uploaded

UPDATE products
SET
  image = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
  updated_at = NOW()
WHERE id IN ('w1', 'a1');
