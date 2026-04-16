-- 重置数据库脚本
-- 警告：执行此脚本将清空所有现有留言记录和 IP 限制记录

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS rate_limits;

-- 创建留言表
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,              -- 姓名
    email TEXT,             -- 电子邮箱
    country_code TEXT,      -- 区号
    whatsapp TEXT,          -- WhatsApp 号码
    message TEXT,           -- 留言内容
    ip TEXT,                -- 来源 IP
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 提交时间
);

-- 创建 IP 频率限制表
CREATE TABLE rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    window_start INTEGER    -- 时间窗口起始点
);

-- 创建新闻表 (用于新闻中心)
CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                -- 标题
    slug TEXT UNIQUE NOT NULL,          -- SEO 友好路径 (URL)
    excerpt TEXT,                       -- 摘要
    content TEXT,                       -- 正文内容 (HTML)
    cover_image TEXT,                   -- R2 封面图片 URL
    author TEXT DEFAULT '易亿',         -- 作者
    category TEXT DEFAULT '行业资讯',   -- 分类
    status TEXT DEFAULT 'published',    -- 状态 (published/draft)
    meta_keywords TEXT,                 -- SEO 关键词
    meta_description TEXT,              -- SEO 描述
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以加速路径查找
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
