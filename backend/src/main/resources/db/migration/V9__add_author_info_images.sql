ALTER TABLE book_authors
  ADD COLUMN IF NOT EXISTS info_image_1 TEXT,
  ADD COLUMN IF NOT EXISTS info_image_2 TEXT,
  ADD COLUMN IF NOT EXISTS info_image_3 TEXT;

UPDATE book_authors
SET
  info_image_1 = COALESCE(info_image_1, avatar_url),
  info_image_2 = COALESCE(info_image_2, avatar_url),
  info_image_3 = COALESCE(info_image_3, avatar_url)
WHERE info_image_1 IS NULL OR info_image_2 IS NULL OR info_image_3 IS NULL;
