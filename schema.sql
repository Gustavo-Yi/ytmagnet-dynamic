-- Reset database schema.
-- Warning: running this script clears existing contact messages and IP limits.

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS news_posts;

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    country_code TEXT,
    whatsapp TEXT,
    message TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    window_start INTEGER
);

CREATE TABLE news_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('company', 'industry', 'faq')),
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
    pinned INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_posts_public
    ON news_posts (status, published_at DESC, id DESC);

CREATE INDEX idx_news_posts_category
    ON news_posts (category, status, published_at DESC);

CREATE INDEX idx_news_posts_pinned
    ON news_posts (status, pinned DESC, published_at DESC, id DESC);
