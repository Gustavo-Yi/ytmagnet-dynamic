CREATE TABLE IF NOT EXISTS news_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('company', 'product', 'industry')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    title_zh TEXT NOT NULL,
    title_en TEXT,
    summary_zh TEXT,
    summary_en TEXT,
    content_zh TEXT NOT NULL,
    content_en TEXT,
    cover_image_key TEXT,
    cover_image_url TEXT,
    cover_image_alt_zh TEXT,
    cover_image_alt_en TEXT,
    seo_title_zh TEXT,
    seo_title_en TEXT,
    seo_description_zh TEXT,
    seo_description_en TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_posts_public
    ON news_posts (status, published_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_news_posts_category
    ON news_posts (category, status, published_at DESC);
