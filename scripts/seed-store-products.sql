-- Seed products table with default store products.
-- Run in Supabase Dashboard → SQL Editor (backup project).
-- Idempotent: INSERT ... ON CONFLICT DO UPDATE.

INSERT INTO products (id, title, price, category, image, image_coming_soon, coming_soon_image, description, inventory, featured)
VALUES
  ('m1', 'Lord''s Cross Lifter Tee', 32.00, 'Men''s Apparel', '/media/merchandise/lords-cross-lifter-tee.png.jpg', false, null, null, null, false),
  ('m2', 'Lord''s Cross Carrier Hoodie', 55.00, 'Men''s Apparel', '/media/merchandise/lords-cross-carrier-hoodie.png.jpg', false, null, null, null, false),
  ('m3', 'Lord''s Squatting Cross Hoodie', 55.00, 'Men''s Apparel', '/media/merchandise/lords-squatting-cross-hoodie.png.jpg', false, null, null, null, false),
  ('m4', 'Son of Man Long Sleeve', 38.00, 'Men''s Apparel', '/media/merchandise/son-of-man-long-sleeve.png.jpg', false, null, null, null, false),
  ('m5', 'Lord''s Squatting Cross Tee', 32.00, 'Men''s Apparel', '/media/merchandise/lords-squatting-cross-tee.png.jpg', false, null, null, null, false),
  ('m6', 'Lord''s Cross Lifter Long Sleeve', 38.00, 'Men''s Apparel', '/media/merchandise/lords-cross-lifter-long-sleeve.png.jpg', false, null, null, null, false),
  ('m7', 'Lord''s Cross Barbell Hoodie', 55.00, 'Men''s Apparel', '/media/merchandise/lords-cross-barbell-hoodie.png.jpg', false, null, null, null, false),
  ('w1', 'Faith Over Fear Tee', 32.00, 'Women''s Apparel', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', false, null, null, null, false),
  ('a1', 'Scripture Wristbands (3-Pack)', 10.00, 'Accessories', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', false, null, null, null, false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  updated_at = now();
