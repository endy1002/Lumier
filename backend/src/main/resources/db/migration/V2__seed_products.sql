INSERT INTO products (id, name, category, base_price, is_available)
VALUES
  (1, 'Tren doi mo mat va mo', 'CHARM', 100000, TRUE),
  (2, 'The Other Side', 'CHARM', 100000, TRUE),
  (3, 'Takahashi', 'CHARM', 100000, TRUE),
  (4, 'Ngon den khong tat', 'CHARM', 100000, TRUE),
  (5, 'Golden Book Charms Bookmark', 'BOOKMARK', 50000, TRUE),
  (6, 'Artistic Bookmarks Set', 'BOOKMARK', 50000, TRUE),
  (7, 'Lumier Classic Notebook', 'NOTEBOOK', 85000, TRUE),
  (8, 'The Storyteller Journal', 'NOTEBOOK', 95000, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  base_price = EXCLUDED.base_price,
  is_available = EXCLUDED.is_available;

SELECT setval('products_id_seq', GREATEST((SELECT MAX(id) FROM products), 1));
