ALTER TABLE news_posts ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_news_posts_pinned
    ON news_posts (status, pinned DESC, published_at DESC, id DESC);
