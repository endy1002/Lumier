CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(180) NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  cover_image_url TEXT,
  source_name VARCHAR(120),
  seo_title VARCHAR(255),
  seo_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_blog_posts_slug ON blog_posts (lower(slug));
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (is_published, published_at DESC);
