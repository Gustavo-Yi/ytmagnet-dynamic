CREATE TABLE news_posts_new (
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

INSERT INTO news_posts_new (
    id,
    slug,
    category,
    status,
    title_zh,
    title_en,
    summary_zh,
    summary_en,
    content_zh,
    content_en,
    cover_image_key,
    cover_image_url,
    cover_image_alt_zh,
    cover_image_alt_en,
    seo_title_zh,
    seo_title_en,
    seo_description_zh,
    seo_description_en,
    pinned,
    featured,
    published_at,
    created_at,
    updated_at
)
SELECT
    id,
    slug,
    CASE
        WHEN category = 'product' THEN 'company'
        WHEN category IN ('company', 'industry', 'faq') THEN category
        ELSE 'company'
    END,
    status,
    title_zh,
    title_en,
    summary_zh,
    summary_en,
    content_zh,
    content_en,
    cover_image_key,
    cover_image_url,
    cover_image_alt_zh,
    cover_image_alt_en,
    seo_title_zh,
    seo_title_en,
    seo_description_zh,
    seo_description_en,
    pinned,
    featured,
    published_at,
    created_at,
    updated_at
FROM news_posts;

DROP TABLE news_posts;
ALTER TABLE news_posts_new RENAME TO news_posts;

CREATE INDEX IF NOT EXISTS idx_news_posts_public
    ON news_posts (status, published_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_news_posts_category
    ON news_posts (category, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_posts_pinned
    ON news_posts (status, pinned DESC, published_at DESC, id DESC);
