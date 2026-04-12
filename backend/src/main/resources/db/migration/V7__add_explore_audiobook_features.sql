CREATE TABLE IF NOT EXISTS book_authors (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  featured_works TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS book_summaries (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  tag VARCHAR(128),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS audiobooks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author_id BIGINT NOT NULL REFERENCES book_authors(id),
  narrator VARCHAR(255),
  duration_minutes INT,
  cover_image_url TEXT,
  summary TEXT,
  audio_file_url TEXT,
  audio_format VARCHAR(16),
  product_id BIGINT REFERENCES products(id),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_audiobooks_product_id
  ON audiobooks(product_id)
  WHERE product_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS audiobook_access_codes (
  id BIGSERIAL PRIMARY KEY,
  code_value VARCHAR(64) NOT NULL,
  code_normalized VARCHAR(64) NOT NULL UNIQUE,
  audiobook_id BIGINT NOT NULL REFERENCES audiobooks(id),
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  issued_to_google_id VARCHAR(255) NOT NULL,
  redeemed_by_google_id VARCHAR(255),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_audiobook_codes_issued_to_google
  ON audiobook_access_codes(issued_to_google_id);

CREATE INDEX IF NOT EXISTS idx_audiobook_codes_redeemed_by_google
  ON audiobook_access_codes(redeemed_by_google_id);

INSERT INTO book_authors (id, name, bio, avatar_url, featured_works, display_order, is_active)
VALUES
  (1, 'Nguyễn Nhật Ánh', 'Nhà văn Việt Nam nổi tiếng với các tác phẩm văn học thiếu nhi và tuổi mới lớn. Ông được mệnh danh là nhà văn của tuổi thơ.', '/images/authors/01.jpeg', 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh|Cho Tôi Xin Một Vé Đi Tuổi Thơ|Mắt Biếc', 1, TRUE),
  (2, 'Nam Cao', 'Một trong những nhà văn tiêu biểu nhất của văn học hiện thực phê phán Việt Nam, với những tác phẩm sâu sắc về con người và xã hội.', '/images/authors/02.jpeg', 'Chí Phèo|Lão Hạc|Đời Thừa', 2, TRUE),
  (3, 'Nguyễn Du', 'Đại thi hào dân tộc Việt Nam, tác giả của Truyện Kiều - kiệt tác văn học cổ điển Việt Nam.', '/images/authors/03.jpeg', 'Truyện Kiều|Văn Chiêu Hồn', 3, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  featured_works = EXCLUDED.featured_works,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

SELECT setval('book_authors_id_seq', GREATEST((SELECT MAX(id) FROM book_authors), 1));

INSERT INTO book_summaries (id, title, author_name, excerpt, tag, display_order, is_active)
VALUES
  (1, 'Nhà Giả Kim', 'Paulo Coelho', 'Câu chuyện về chàng chăn cừu Santiago trong hành trình theo đuổi giấc mơ vượt sa mạc Sahara...', 'Phiêu lưu', 1, TRUE),
  (2, 'Đắc Nhân Tâm', 'Dale Carnegie', 'Những nguyên tắc cơ bản trong giao tiếp và cách đối nhân xử thế để chinh phục lòng người...', 'Self-help', 2, TRUE),
  (3, 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Nguyễn Nhật Ánh', 'Câu chuyện tuổi thơ trong sáng về tình bạn, tình anh em và cuộc sống làng quê miền Trung...', 'Văn học Việt', 3, TRUE)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  author_name = EXCLUDED.author_name,
  excerpt = EXCLUDED.excerpt,
  tag = EXCLUDED.tag,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

SELECT setval('book_summaries_id_seq', GREATEST((SELECT MAX(id) FROM book_summaries), 1));

INSERT INTO audiobooks (id, title, author_id, narrator, duration_minutes, cover_image_url, summary, audio_file_url, audio_format, product_id, display_order, is_active)
VALUES
  (1, 'Nhà Giả Kim', 1, 'Minh Tú', 272, '/images/BookCover/01.webp', 'Câu chuyện về chàng chăn cừu Santiago trong hành trình theo đuổi giấc mơ, vượt sa mạc Sahara để tìm kho báu tại Kim Tự Tháp Ai Cập.', '/audio/nha-gia-kim.mp3', 'mp3', 1, 1, TRUE),
  (2, 'Đắc Nhân Tâm', 2, 'Hoàng Anh', 375, '/images/BookCover/02.png', 'Những nguyên tắc cơ bản trong giao tiếp và cách đối nhân xử thế để chinh phục lòng người.', '/audio/dac-nhan-tam.m4a', 'm4a', 2, 2, TRUE),
  (3, 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 1, 'Thanh Hà', 348, '/images/BookCover/03.jpeg', 'Câu chuyện tuổi thơ trong sáng về tình bạn, tình anh em và cuộc sống làng quê miền Trung.', '/audio/hoa-vang-tren-co-xanh.mp3', 'mp3', 3, 3, TRUE),
  (4, 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', 1, 'Minh Châu', 200, '/images/BookCover/04.jpeg', 'Hành trình ngược dòng thời gian trở về tuổi thơ với những kỷ niệm đẹp đẽ và hồn nhiên.', '/audio/ve-di-tuoi-tho.m4a', 'm4a', 4, 4, TRUE)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  author_id = EXCLUDED.author_id,
  narrator = EXCLUDED.narrator,
  duration_minutes = EXCLUDED.duration_minutes,
  cover_image_url = EXCLUDED.cover_image_url,
  summary = EXCLUDED.summary,
  audio_file_url = EXCLUDED.audio_file_url,
  audio_format = EXCLUDED.audio_format,
  product_id = EXCLUDED.product_id,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

SELECT setval('audiobooks_id_seq', GREATEST((SELECT MAX(id) FROM audiobooks), 1));
