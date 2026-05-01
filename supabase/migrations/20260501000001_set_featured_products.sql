-- Set w1 (Faith Over Fear Tee) and a1 (Scripture Wristbands) as featured products
UPDATE products
SET featured = true, updated_at = NOW()
WHERE id IN ('w1', 'a1');
