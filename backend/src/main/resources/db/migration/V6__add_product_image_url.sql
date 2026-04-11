ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE products
SET image_url = CASE id
  WHEN 1 THEN '/showing/cover/A1.jpg'
  WHEN 2 THEN '/showing/cover/A2.jpg'
  WHEN 3 THEN '/showing/cover/A3.jpg'
  WHEN 4 THEN '/showing/cover/A4.jpg'
  WHEN 5 THEN '/showing/bookmark/D1.jpg'
  WHEN 6 THEN '/showing/bookmark/D2.jpg'
  WHEN 7 THEN '/showing/notes/B1.jpg'
  WHEN 8 THEN '/showing/notes/B2.jpg'
  ELSE image_url
END
WHERE image_url IS NULL OR image_url = '';
