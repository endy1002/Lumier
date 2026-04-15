INSERT INTO products (id, name, category, base_price, image_url, is_available)
VALUES
  (1, 'Tren doi mo mat va mo', 'CHARM', 100000, '/showing/cover/A1.jpg', TRUE),
  (2, 'The Other Side', 'CHARM', 100000, '/showing/cover/A2.jpg', TRUE),
  (3, 'Takahashi', 'CHARM', 100000, '/showing/cover/A3.jpg', TRUE),
  (4, 'Ngon den khong tat', 'CHARM', 100000, '/showing/cover/A4.jpg', TRUE),
  (5, 'Golden Book Charms Bookmark', 'BOOKMARK', 50000, '/showing/bookmark/D1.jpg', TRUE),
  (6, 'Artistic Bookmarks Set', 'BOOKMARK', 50000, '/showing/bookmark/D2.jpg', TRUE),
  (7, 'Lumier Classic Notebook', 'NOTEBOOK', 85000, '/showing/notes/B1.jpg', TRUE),
  (8, 'The Storyteller Journal', 'NOTEBOOK', 95000, '/showing/notes/B2.jpg', TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

SELECT setval('products_id_seq', GREATEST((SELECT MAX(id) FROM products), 1));
